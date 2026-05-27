"use server";


import { fail, ok } from "@/lib/action-result";
import {
  ChannelConflictResolutionStatus,
  ChannelConflictSeverity,
  ChannelImportRecordType,
  ChannelImportSourceType,
  ChannelRecordValidationStatus,
  IntegrationProvider,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

import { requireChannelManageActor } from "@/lib/channels/require-channel-manage-actor";
import {
  channelConflictWhereForOwner,
  channelImportBatchByIdWhereForOwner,
  channelImportBatchRelationWhere,
} from "@/lib/scope/channel-import-scope";
import {
  externalOrderByIdWhereForOwner,
  externalOrderListWhereForOwner,
} from "@/lib/scope/workspace-channel-scope";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { orderByIdWhereForOwner } from "@/lib/scope/workspace-order-scope";
import {
  DEFAULT_CHANNEL_HANDOFF,
  mergeHandoffUpdate,
  parseChannelHandoffJson,
  type ChannelHandoffSettings,
} from "@/lib/channels/channel-handoff";
import {
  recalculateImportBatchStats,
  revalidateChannelImportRecord,
} from "@/lib/channels/import-staging";
import { simulationBatchDedupeKey } from "@/lib/channels/idempotency";
import { requireIntegrationsReadActor } from "@/lib/integrations/require-integrations-actor";
import { requireChannelActor } from "@/lib/channels/require-channel-actor";
import type { NormalizedKitchenOrder } from "@/lib/order-normalization";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";

export async function approveChannelImportRecords(input: { recordIds: string[] }) {
  try {
    const gate = await requireChannelManageActor({
      operation: "channel.import.approve",
      metadata: { recordCount: input.recordIds.length },
    });
    if (!gate.ok) return { error: gate.error };
    const { userId } = gate;
    const batchRelation = await channelImportBatchRelationWhere(userId);
    for (const rid of input.recordIds) {
      const record = await prisma.channelImportRecord.findFirst({
        where: { id: rid, batch: batchRelation },
        include: { batch: true },
      });
      if (!record) continue;
      if (record.validationStatus !== ChannelRecordValidationStatus.VALID) continue;
      if (record.importedAt) continue;

      const ext = await prisma.externalOrder.findFirst({
        where: {
          AND: [
            await externalOrderListWhereForOwner(userId),
            {
              connectionId: record.batch.connectionId ?? undefined,
              provider: record.provider,
              externalOrderId: record.externalId,
            },
          ],
        },
      });
      if (!ext) continue;

      await prisma.channelImportRecord.update({
        where: { id: record.id },
        data: {
          importedEntityId: ext.id,
          importedAt: new Date(),
        },
      });
      await recalculateImportBatchStats(record.batchId);
    }
    revalidatePath("/dashboard/sales-channels/staging");
    revalidatePath("/dashboard/order-hub");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function rejectChannelImportRecord(input: { recordId: string; reason: string }) {
  try {
    const gate = await requireChannelManageActor({
      operation: "channel.import.reject",
      metadata: { recordId: input.recordId },
    });
    if (!gate.ok) return { error: gate.error };
    const { userId } = gate;
    const record = await prisma.channelImportRecord.findFirst({
      where: { id: input.recordId, batch: await channelImportBatchRelationWhere(userId) },
    });
    if (!record) throw new Error("NOT_FOUND");
    await prisma.channelImportRecord.update({
      where: { id: record.id },
      data: {
        validationStatus: ChannelRecordValidationStatus.ERROR,
        suggestedFixJson: { action: "rejected", reason: input.reason },
      },
    });
    await recalculateImportBatchStats(record.batchId);
    revalidatePath("/dashboard/sales-channels/staging");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function retryChannelImportValidation(input: { recordId: string }) {
  try {
    const gate = await requireChannelManageActor({
      operation: "channel.import.retry_validation",
      metadata: { recordId: input.recordId },
    });
    if (!gate.ok) return { error: gate.error };
    const { userId } = gate;
    await revalidateChannelImportRecord(input.recordId, userId);
    revalidatePath("/dashboard/sales-channels/staging");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function resolveChannelConflict(input: {
  conflictId: string;
  status: "RESOLVED" | "IGNORED";
}) {
  try {
    const gate = await requireChannelManageActor({
      operation: "channel.conflict.resolve",
      metadata: { conflictId: input.conflictId, status: input.status },
    });
    if (!gate.ok) return { error: gate.error };
    const { profile, userId } = gate;
    await prisma.channelConflict.updateMany({
      where: { id: input.conflictId, ...(await channelConflictWhereForOwner(userId)) },
      data: {
        status: input.status,
        resolvedBy: profile.email,
        resolvedAt: new Date(),
      },
    });
    revalidatePath("/dashboard/sales-channels/conflicts");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function saveChannelHandoffSettings(patch: Partial<ChannelHandoffSettings>) {
  try {
    const gate = await requireChannelManageActor({ operation: "channel.handoff.save" });
    if (!gate.ok) return { error: gate.error };
    const { userId } = gate;
    const ks = await prisma.kitchenSettings.findUnique({
      where: { userId },
    });
    await prisma.kitchenSettings.upsert({
      where: { userId },
      create: {
        userId,
        channelHandoffJson: mergeHandoffUpdate(null, { ...DEFAULT_CHANNEL_HANDOFF, ...patch }),
      },
      update: {
        channelHandoffJson: mergeHandoffUpdate(ks?.channelHandoffJson ?? null, {
          ...parseChannelHandoffJson(ks?.channelHandoffJson),
          ...patch,
        }),
      },
    });
    revalidatePath("/dashboard/sales-channels/handoff");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createChannelRule(input: {
  name: string;
  description?: string;
  trigger: import("@prisma/client").ChannelRuleTrigger;
  conditionsJson: unknown;
  actionsJson: unknown;
}) {
  try {
    const gate = await requireChannelManageActor({ operation: "channel.rule.create" });
    if (!gate.ok) return { error: gate.error };
    const { userId } = gate;
    await prisma.channelRule.create({
      data: {
        userId,
        name: input.name,
        description: input.description ?? null,
        trigger: input.trigger,
        conditionsJson: input.conditionsJson as object,
        actionsJson: input.actionsJson as object,
        active: true,
      },
    });
    revalidatePath("/dashboard/sales-channels/rules");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function toggleChannelRule(input: { ruleId: string; active: boolean }) {
  try {
    const gate = await requireChannelManageActor({
      operation: "channel.rule.toggle",
      metadata: { ruleId: input.ruleId, active: input.active },
    });
    if (!gate.ok) return { error: gate.error };
    const { userId } = gate;
    await prisma.channelRule.updateMany({
      where: { id: input.ruleId, userId },
      data: { active: input.active },
    });
    revalidatePath("/dashboard/sales-channels/rules");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function rollbackChannelImportBatch(input: { batchId: string; reason?: string }) {
  try {
    const gate = await requireChannelManageActor({
      operation: "channel.import.rollback",
      metadata: { batchId: input.batchId },
    });
    if (!gate.ok) return { error: gate.error };
    const { profile, userId } = gate;
    const batch = await prisma.channelImportBatch.findFirst({
      where: await channelImportBatchByIdWhereForOwner(userId, input.batchId),
    });
    if (!batch) throw new Error("NOT_FOUND");

    const records = await prisma.channelImportRecord.findMany({
      where: { batchId: batch.id, importedAt: { not: null } },
    });

    for (const r of records) {
      if (!r.importedEntityId) continue;
      const ext = await prisma.externalOrder.findFirst({
        where: await externalOrderByIdWhereForOwner(userId, r.importedEntityId),
      });
      if (ext?.importedOrderId) {
        const order = await prisma.order.findFirst({
          where: await orderByIdWhereForOwner(userId, ext.importedOrderId),
          include: { orderItems: { include: { product: { include: { productionTask: true } } } } },
        });
        const started = order?.orderItems.some((oi) => oi.product?.productionTask?.cooked);
        if (started) {
          throw new Error(
            "Production has already started for an order linked to this batch; rollback blocked.",
          );
        }
      }
    }

    await prisma.$transaction([
      prisma.channelImportRollback.create({
        data: {
          batchId: batch.id,
          userId,
          performedBy: profile.email,
          reason: input.reason ?? null,
          recordsRolledBack: records.length,
        },
      }),
      prisma.channelImportRecord.updateMany({
        where: { batchId: batch.id },
        data: { importedEntityId: null, importedAt: null },
      }),
    ]);

    await recalculateImportBatchStats(batch.id);
    await prisma.channelImportBatch.update({
      where: { id: batch.id },
      data: { status: "CANCELLED" },
    });
    revalidatePath(`/dashboard/sales-channels/imports/${batch.id}`);
    revalidatePath("/dashboard/sales-channels/staging");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function runChannelIngestSimulation(input: { scenario: string }) {
  try {
    const gate = await requireChannelManageActor({
      operation: "channel.simulator.run",
      metadata: { scenario: input.scenario },
    });
    if (!gate.ok) return { error: gate.error };
    const { userId } = gate;
    const externalOrderId = `sim-${input.scenario}-${randomUUID().slice(0, 8)}`;
    let lineItems: NormalizedKitchenOrder["lineItems"];
    if (input.scenario === "unmatched_product") {
      lineItems = [{ title: "Unknown item", quantity: 1, sku: null }];
    } else if (input.scenario === "missing_fulfillment") {
      lineItems = [{ title: "Test SKU", quantity: 1, sku: "SIM-1" }];
    } else {
      lineItems = [{ title: "Test SKU", quantity: 1, sku: "SIM-1" }];
    }

    const normalized: NormalizedKitchenOrder = {
      provider: IntegrationProvider.WOOCOMMERCE,
      externalOrderId,
      externalOrderNumber: externalOrderId,
      normalizedStatus: "OPEN",
      customer: {
        name: "Simulation customer",
        email: "simulation@example.invalid",
        phone: null,
      },
      lineItems,
      fulfillment: {
        type: "PICKUP",
        pickupTime: input.scenario === "missing_fulfillment" ? null : new Date(),
        deliveryTime: null,
        deliveryAddress: null,
      },
      totals: { total: 42, currency: "USD", subtotal: 42, tax: 0, deliveryFee: 0 },
      raw: { test: true, scenario: input.scenario },
    };

    const sourceDedupeKey = simulationBatchDedupeKey(randomUUID());
    const workspaceId = await resolveOwnerWorkspaceId(userId);
    const batch = await prisma.channelImportBatch.create({
      data: {
        userId,
        workspaceId: workspaceId ?? undefined,
        provider: IntegrationProvider.WOOCOMMERCE,
        sourceType: ChannelImportSourceType.MANUAL,
        sourceDedupeKey,
        status: "DRAFT",
      },
    });

    let validationStatus: ChannelRecordValidationStatus = ChannelRecordValidationStatus.VALID;
    if (input.scenario === "unmatched_product") {
      validationStatus = ChannelRecordValidationStatus.NEEDS_MAPPING;
    } else if (input.scenario === "duplicate_order") {
      validationStatus = ChannelRecordValidationStatus.DUPLICATE;
    }

    const record = await prisma.channelImportRecord.create({
      data: {
        batchId: batch.id,
        provider: IntegrationProvider.WOOCOMMERCE,
        externalId: externalOrderId,
        recordType: ChannelImportRecordType.ORDER,
        rawPayloadJson: normalized.raw as object,
        normalizedJson: normalized as unknown as object,
        validationStatus,
      },
    });

    if (input.scenario === "duplicate_order") {
      await prisma.channelConflict.create({
        data: {
          userId,
          workspaceId,
          batchId: batch.id,
          recordId: record.id,
          conflictType: "duplicate_external_order",
          severity: ChannelConflictSeverity.WARNING,
          title: "Possible duplicate",
          description: "Simulation flagged this row as a duplicate for operator training.",
          suggestedAction: "Merge or ignore in the conflict center.",
          status: ChannelConflictResolutionStatus.OPEN,
        },
      });
    }

    if (input.scenario === "unmatched_product") {
      await prisma.channelConflict.create({
        data: {
          userId,
          workspaceId,
          batchId: batch.id,
          recordId: record.id,
          conflictType: "missing_product_mapping",
          severity: ChannelConflictSeverity.WARNING,
          title: "Product mapping required",
          description: "Simulation order has no resolvable SKUs.",
          suggestedAction: "Map SKUs, then retry validation.",
          status: ChannelConflictResolutionStatus.OPEN,
        },
      });
    }

    await recalculateImportBatchStats(batch.id);
    revalidatePath("/dashboard/sales-channels/staging");
    revalidatePath("/dashboard/sales-channels/simulator");
    return { ok: true as const, batchId: batch.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function processWebhookLabPayload(input: {
  provider: IntegrationProvider;
  topic: string;
  payloadText: string;
  markTest: boolean;
}) {
  try {
    const gate = await requireChannelManageActor({
      operation: "channel.webhook_lab.process",
      metadata: { provider: input.provider, topic: input.topic },
    });
    if (!gate.ok) return { error: gate.error };
    const { userId } = gate;
    let payload: unknown;
    try {
      payload = JSON.parse(input.payloadText);
    } catch {
      throw new Error("Invalid JSON payload");
    }
    const wrapped = input.markTest ? { __kitchenosTest: true, topic: input.topic, body: payload } : payload;
    const workspaceId = await resolveOwnerWorkspaceId(userId);
    const event = await prisma.webhookEvent.create({
      data: {
        userId,
        workspaceId,
        provider: input.provider,
        topic: input.topic,
        payloadJson: wrapped as object,
        signatureValid: true,
        processed: true,
        processedAt: new Date(),
      },
    });
    revalidatePath("/dashboard/sales-channels/webhook-lab");
    return { ok: true as const, eventId: event.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function exportChannelImportErrorCsv(batchId: string) {
  try {
    const read = await requireIntegrationsReadActor({
      operation: "channel.import.export_errors",
      metadata: { batchId },
    });
    if (!read.ok) return { error: read.error };
    const { userId } = await requireChannelActor();
    const records = await prisma.channelImportRecord.findMany({
      where: {
        batchId,
        batch: await channelImportBatchRelationWhere(userId),
        validationStatus: {
          in: [
            ChannelRecordValidationStatus.ERROR,
            ChannelRecordValidationStatus.DUPLICATE,
            ChannelRecordValidationStatus.NEEDS_MAPPING,
          ],
        },
      },
      select: {
        id: true,
        externalId: true,
        validationStatus: true,
        suggestedFixJson: true,
      },
    });
    const header = "id,external_id,validation_status,suggested_fix_json\n";
    const body = records
      .map((r) => {
        const fix = JSON.stringify(r.suggestedFixJson ?? {});
        return `${r.id},${r.externalId},${r.validationStatus},${fix.replaceAll(",", ";")}`;
      })
      .join("\n");
    return { ok: true as const, csv: header + body };
  } catch (e) {
    return { error: safeError(e) };
  }
}
