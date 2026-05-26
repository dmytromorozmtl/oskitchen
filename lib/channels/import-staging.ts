import type { IntegrationProvider } from "@prisma/client";
import {
  ChannelConflictResolutionStatus,
  ChannelConflictSeverity,
  ChannelImportBatchStatus,
  ChannelImportRecordType,
  ChannelImportSourceType,
  ChannelRecordValidationStatus,
  Prisma,
} from "@prisma/client";

import type { NormalizedKitchenOrder } from "@/lib/order-normalization";
import { prisma } from "@/lib/prisma";

import { syncJobBatchDedupeKey, webhookEventBatchDedupeKey } from "./idempotency";

function validationForOrder(
  normalized: NormalizedKitchenOrder,
): ChannelRecordValidationStatus {
  if (!normalized.lineItems?.length) {
    return ChannelRecordValidationStatus.ERROR;
  }
  const hasSku = normalized.lineItems.some((l) => l.sku?.trim());
  if (!hasSku) {
    return ChannelRecordValidationStatus.NEEDS_MAPPING;
  }
  const hasContact =
    Boolean(normalized.customer.email?.trim()) || Boolean(normalized.customer.phone?.trim());
  if (!hasContact) {
    return ChannelRecordValidationStatus.WARNING;
  }
  return ChannelRecordValidationStatus.VALID;
}

export async function recalculateImportBatchStats(batchId: string) {
  const list = await prisma.channelImportRecord.findMany({
    where: { batchId },
    select: { validationStatus: true, importedAt: true },
  });
  const total = list.length;
  let valid = 0;
  let warning = 0;
  let error = 0;
  let imported = 0;
  for (const r of list) {
    if (r.importedAt) imported++;
    switch (r.validationStatus) {
      case "VALID":
        valid++;
        break;
      case "WARNING":
      case "NEEDS_MAPPING":
        warning++;
        break;
      case "ERROR":
      case "DUPLICATE":
        error++;
        break;
      default:
        break;
    }
  }

  let nextStatus: ChannelImportBatchStatus;
  if (total === 0) {
    nextStatus = ChannelImportBatchStatus.DRAFT;
  } else if (imported === total) {
    nextStatus = ChannelImportBatchStatus.IMPORTED;
  } else if (imported > 0) {
    nextStatus = ChannelImportBatchStatus.PARTIAL;
  } else if (list.some((r) => r.validationStatus === "ERROR")) {
    nextStatus = ChannelImportBatchStatus.NEEDS_REVIEW;
  } else if (
    list.some(
      (r) =>
        r.validationStatus === "WARNING" ||
        r.validationStatus === "NEEDS_MAPPING" ||
        r.validationStatus === "DUPLICATE",
    )
  ) {
    nextStatus = ChannelImportBatchStatus.NEEDS_REVIEW;
  } else if (list.every((r) => r.validationStatus === "VALID")) {
    nextStatus = ChannelImportBatchStatus.READY_TO_IMPORT;
  } else {
    nextStatus = ChannelImportBatchStatus.VALIDATING;
  }

  await prisma.channelImportBatch.update({
    where: { id: batchId },
    data: {
      totalRecords: total,
      validRecords: valid,
      warningRecords: warning,
      errorRecords: error,
      importedRecords: imported,
      status: nextStatus,
    },
  });
}

async function ensureMappingConflict(input: {
  userId: string;
  batchId: string;
  recordId: string;
}) {
  const existing = await prisma.channelConflict.findFirst({
    where: {
      recordId: input.recordId,
      status: ChannelConflictResolutionStatus.OPEN,
      conflictType: "missing_product_mapping",
    },
  });
  if (existing) return;
  await prisma.channelConflict.create({
    data: {
      userId: input.userId,
      batchId: input.batchId,
      recordId: input.recordId,
      conflictType: "missing_product_mapping",
      severity: ChannelConflictSeverity.WARNING,
      title: "Product mapping required",
      description: "Line items do not include SKUs that can be matched automatically.",
      suggestedAction: "Map SKUs in Sales channels → Mapping, then retry validation.",
      status: ChannelConflictResolutionStatus.OPEN,
    },
  });
}

export async function stageWebhookOrderIngest(input: {
  userId: string;
  connectionId: string | null;
  provider: IntegrationProvider;
  webhookEventId: string;
  rawPayload: unknown;
  normalized: NormalizedKitchenOrder;
}): Promise<string> {
  const sourceDedupeKey = webhookEventBatchDedupeKey(input.webhookEventId);
  const externalId = input.normalized.externalOrderId;
  const validation = validationForOrder(input.normalized);

  const batch = await prisma.channelImportBatch.upsert({
    where: { sourceDedupeKey },
    create: {
      userId: input.userId,
      connectionId: input.connectionId ?? undefined,
      provider: input.provider,
      sourceType: ChannelImportSourceType.WEBHOOK,
      sourceDedupeKey,
      status: ChannelImportBatchStatus.DRAFT,
    },
    update: {
      updatedAt: new Date(),
    },
  });

  const record = await prisma.channelImportRecord.upsert({
    where: {
      batchId_provider_externalId: {
        batchId: batch.id,
        provider: input.provider,
        externalId,
      },
    },
    create: {
      batchId: batch.id,
      provider: input.provider,
      externalId,
      recordType: ChannelImportRecordType.ORDER,
      rawPayloadJson: input.rawPayload as Prisma.InputJsonValue,
      normalizedJson: input.normalized as unknown as Prisma.InputJsonValue,
      validationStatus: validation,
      webhookEventId: input.webhookEventId,
    },
    update: {
      rawPayloadJson: input.rawPayload as Prisma.InputJsonValue,
      normalizedJson: input.normalized as unknown as Prisma.InputJsonValue,
      validationStatus: validation,
      webhookEventId: input.webhookEventId,
    },
  });

  if (validation === ChannelRecordValidationStatus.NEEDS_MAPPING) {
    await ensureMappingConflict({
      userId: input.userId,
      batchId: batch.id,
      recordId: record.id,
    });
  }

  if (input.connectionId) {
    await prisma.externalOrder.updateMany({
      where: {
        userId: input.userId,
        connectionId: input.connectionId,
        provider: input.provider,
        externalOrderId: externalId,
      },
      data: { channelImportBatchId: batch.id },
    });
  }

  await recalculateImportBatchStats(batch.id);
  return batch.id;
}

export async function stageSyncJobOrders(input: {
  syncJobId: string;
  userId: string;
  connectionId: string;
  provider: IntegrationProvider;
  entries: Array<{ raw: unknown; normalized: NormalizedKitchenOrder }>;
}): Promise<void> {
  if (!input.entries.length) return;
  const sourceDedupeKey = syncJobBatchDedupeKey(input.syncJobId);

  const batch = await prisma.channelImportBatch.upsert({
    where: { sourceDedupeKey },
    create: {
      userId: input.userId,
      connectionId: input.connectionId,
      provider: input.provider,
      sourceType: ChannelImportSourceType.SYNC,
      sourceDedupeKey,
      status: ChannelImportBatchStatus.DRAFT,
    },
    update: { updatedAt: new Date() },
  });

  const rows: Prisma.ChannelImportRecordCreateManyInput[] = input.entries.map((e) => ({
    batchId: batch.id,
    provider: input.provider,
    externalId: e.normalized.externalOrderId,
    recordType: ChannelImportRecordType.ORDER,
    rawPayloadJson: e.raw as Prisma.InputJsonValue,
    normalizedJson: e.normalized as unknown as Prisma.InputJsonValue,
    validationStatus: validationForOrder(e.normalized),
  }));

  await prisma.channelImportRecord.createMany({
    data: rows,
    skipDuplicates: true,
  });

  const createdRecords = await prisma.channelImportRecord.findMany({
    where: { batchId: batch.id, validationStatus: ChannelRecordValidationStatus.NEEDS_MAPPING },
  });
  for (const r of createdRecords) {
    await ensureMappingConflict({
      userId: input.userId,
      batchId: batch.id,
      recordId: r.id,
    });
  }

  await recalculateImportBatchStats(batch.id);

  for (const e of input.entries) {
    await prisma.externalOrder.updateMany({
      where: {
        userId: input.userId,
        connectionId: input.connectionId,
        provider: input.provider,
        externalOrderId: e.normalized.externalOrderId,
      },
      data: { channelImportBatchId: batch.id },
    });
  }
}

export async function revalidateChannelImportRecord(recordId: string, userId: string) {
  const record = await prisma.channelImportRecord.findFirst({
    where: { id: recordId, batch: { userId } },
    include: { batch: true },
  });
  if (!record?.normalizedJson) return;
  const normalized = record.normalizedJson as unknown as NormalizedKitchenOrder;
  const next = validationForOrder(normalized);
  await prisma.channelImportRecord.update({
    where: { id: recordId },
    data: { validationStatus: next },
  });
  await recalculateImportBatchStats(record.batchId);
}
