import type {
  Prisma,
  ProductMapping,
  ProductMappingConfidence,
  ProductMappingEventType,
  ProductMappingProvider,
  ProductMappingStatus,
  ProductModifierMappingStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  productMappingAliasListWhereForOwner,
  productMappingByIdWhereForOwner,
  productMappingListWhereForOwner,
} from "@/lib/scope/workspace-product-mapping-scope";
import {
  integrationConnectionListWhereForOwner,
  productByIdWhereForOwner,
  resolveOwnerScopedWhere,
} from "@/lib/scope/workspace-resource-scope";
import { auditLog } from "@/services/audit/audit-service";
import {
  isBulkApprovable,
  BULK_APPROVABLE,
} from "@/lib/product-mapping/matching-confidence";
import { shouldAttachCandidate } from "@/lib/product-mapping/matching-engine";
import { normalizeProviderKey } from "@/lib/product-mapping/provider-types";
import {
  loadCandidates,
  runMatch,
} from "@/services/product-mapping/matching-service";

export type CreateMappingInput = {
  userId: string;
  performedById?: string | null;
  provider: string;
  externalProductId: string;
  externalVariantId?: string | null;
  externalVariantTitle?: string | null;
  externalTitle: string;
  externalSku?: string | null;
  externalCategory?: string | null;
  externalRawJson?: unknown;
  brandId?: string | null;
  locationId?: string | null;
  salesChannelId?: string | null;
};

export type CreateMappingResult =
  | { ok: true; mapping: ProductMapping }
  | { ok: false; error: string };

async function mappingScopeAnd(
  ownerUserId: string,
  extra: Prisma.ProductMappingWhereInput,
): Promise<Prisma.ProductMappingWhereInput> {
  const scope = await productMappingListWhereForOwner(ownerUserId);
  return { AND: [scope, extra] };
}

async function recordEvent(input: {
  userId: string;
  mappingId?: string | null;
  eventType: ProductMappingEventType;
  performedById?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await prisma.productMappingEvent.create({
    data: {
      userId: input.userId,
      mappingId: input.mappingId ?? null,
      eventType: input.eventType,
      performedById: input.performedById ?? undefined,
      metadataJson: input.metadata
        ? (input.metadata as unknown as Prisma.InputJsonValue)
        : undefined,
    },
  });
}

export async function createOrUpdateMapping(input: CreateMappingInput): Promise<CreateMappingResult> {
  if (!input.externalTitle.trim()) {
    return { ok: false, error: "External title is required" };
  }
  const providerKey: ProductMappingProvider = normalizeProviderKey(input.provider);
  const externalProductId = input.externalProductId || input.externalTitle;
  const externalVariantId = input.externalVariantId ?? "";

  const [outcome, workspaceId, mappingWhere] = await Promise.all([
    runMatch({
      userId: input.userId,
      provider: providerKey,
      externalTitle: input.externalTitle,
      externalSku: input.externalSku,
      externalCategory: input.externalCategory,
      externalProductId,
      brandId: input.brandId,
    }),
    resolveOwnerWorkspaceId(input.userId),
    mappingScopeAnd(input.userId, {
      provider: input.provider,
      externalProductId,
      externalVariantId,
    }),
  ]);

  const candidateId = shouldAttachCandidate(outcome.label) ? outcome.candidateId : null;
  let status: ProductMappingStatus;
  if (outcome.label === "EXACT_SKU" || outcome.label === "EXACT_TITLE" || outcome.label === "HIGH") {
    status = "SUGGESTED";
  } else if (outcome.label === "NONE") {
    status = "UNMAPPED";
  } else {
    status = "NEEDS_REVIEW";
  }

  const existing = await prisma.productMapping.findFirst({
    where: mappingWhere,
    select: { workspaceId: true },
  });

  const mapping = await prisma.productMapping.upsert({
    where: {
      userId_provider_externalProductId_externalVariantId: {
        userId: input.userId,
        provider: input.provider,
        externalProductId,
        externalVariantId,
      },
    },
    update: {
      ...(workspaceId && !existing?.workspaceId ? { workspaceId } : {}),
      externalTitle: input.externalTitle,
      externalSku: input.externalSku ?? null,
      externalCategory: input.externalCategory ?? null,
      externalVariantTitle: input.externalVariantTitle ?? null,
      externalRawJson:
        input.externalRawJson !== undefined
          ? (input.externalRawJson as Prisma.InputJsonValue)
          : undefined,
      providerKey,
      brandId: input.brandId ?? null,
      locationId: input.locationId ?? null,
      salesChannelId: input.salesChannelId ?? null,
      internalProductId: candidateId,
      confidence: outcome.score,
      confidenceScore: outcome.score,
      confidenceLabel: outcome.label,
      matchReasonJson: outcome.reasons as unknown as Prisma.InputJsonValue,
      lastSeenAt: new Date(),
      status,
    },
    create: {
      userId: input.userId,
      workspaceId,
      provider: input.provider,
      providerKey,
      externalProductId,
      externalVariantId,
      externalVariantTitle: input.externalVariantTitle ?? null,
      externalTitle: input.externalTitle,
      externalSku: input.externalSku ?? null,
      externalCategory: input.externalCategory ?? null,
      externalRawJson:
        input.externalRawJson !== undefined
          ? (input.externalRawJson as Prisma.InputJsonValue)
          : undefined,
      brandId: input.brandId ?? null,
      locationId: input.locationId ?? null,
      salesChannelId: input.salesChannelId ?? null,
      internalProductId: candidateId,
      confidence: outcome.score,
      confidenceScore: outcome.score,
      confidenceLabel: outcome.label,
      matchReasonJson: outcome.reasons as unknown as Prisma.InputJsonValue,
      lastSeenAt: new Date(),
      status,
    },
  });

  await recordEvent({
    userId: input.userId,
    mappingId: mapping.id,
    eventType: "SUGGESTED",
    performedById: input.performedById ?? null,
    metadata: {
      confidence: outcome.label,
      score: outcome.score,
      candidateId,
      reasons: outcome.reasons.map((r) => r.code),
    },
  });

  return { ok: true, mapping };
}

export type ApproveInput = {
  userId: string;
  performedById?: string | null;
  mappingId: string;
  internalProductId?: string | null;
};

export async function approveMapping(input: ApproveInput): Promise<{ ok: boolean; error?: string }> {
  const mappingWhere = await productMappingByIdWhereForOwner(input.userId, input.mappingId);
  const existingSelect = {
    id: true,
    status: true,
    internalProductId: true,
    externalTitle: true,
    providerKey: true,
    provider: true,
    confidenceLabel: true,
  } as const;

  let existing: Awaited<ReturnType<typeof prisma.productMapping.findFirst<{ select: typeof existingSelect }>>>;
  let product: { id: string } | null = null;

  if (input.internalProductId) {
    const productWhere = await productByIdWhereForOwner(input.userId, input.internalProductId);
    [existing, product] = await Promise.all([
      prisma.productMapping.findFirst({ where: mappingWhere, select: existingSelect }),
      prisma.product.findFirst({ where: productWhere, select: { id: true } }),
    ]);
  } else {
    existing = await prisma.productMapping.findFirst({ where: mappingWhere, select: existingSelect });
    const targetProductId = existing?.internalProductId;
    if (targetProductId) {
      product = await prisma.product.findFirst({
        where: await productByIdWhereForOwner(input.userId, targetProductId),
        select: { id: true },
      });
    }
  }

  if (!existing) return { ok: false, error: "Mapping not found" };
  const targetProductId = input.internalProductId ?? existing.internalProductId;
  if (!targetProductId) return { ok: false, error: "Pick a OS Kitchen product before approving." };
  if (!product) return { ok: false, error: "Product is not in this workspace." };

  await prisma.$transaction([
    prisma.productMapping.update({
      where: { id: input.mappingId },
      data: {
        internalProductId: targetProductId,
        status: "APPROVED",
        approvedById: input.performedById ?? undefined,
        approvedAt: new Date(),
        rejectedReason: null,
      },
    }),
    prisma.productMappingEvent.create({
      data: {
        userId: input.userId,
        mappingId: input.mappingId,
        eventType: "APPROVED",
        performedById: input.performedById ?? undefined,
        metadataJson: {
          internalProductId: targetProductId,
          confidenceLabel: existing.confidenceLabel ?? null,
        } as Prisma.InputJsonValue,
      },
    }),
  ]);

  void auditLog({
    actor: { userId: input.performedById ?? input.userId },
    action: "PRODUCT_MAPPING_APPROVED",
    category: "PRODUCT_MAPPING",
    source: "USER",
    severity: "NOTICE",
    entity: { type: "ProductMapping", id: input.mappingId, label: existing.externalTitle },
    metadata: { provider: existing.provider, internalProductId: targetProductId },
  });

  return { ok: true };
}

export type RejectInput = {
  userId: string;
  performedById?: string | null;
  mappingId: string;
  reason: string;
};

export async function rejectMapping(input: RejectInput): Promise<{ ok: boolean; error?: string }> {
  const existing = await prisma.productMapping.findFirst({
    where: await productMappingByIdWhereForOwner(input.userId, input.mappingId),
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Mapping not found" };
  await prisma.$transaction([
    prisma.productMapping.update({
      where: { id: input.mappingId },
      data: { status: "REJECTED", rejectedReason: input.reason, internalProductId: null },
    }),
    prisma.productMappingEvent.create({
      data: {
        userId: input.userId,
        mappingId: input.mappingId,
        eventType: "REJECTED",
        performedById: input.performedById ?? undefined,
        metadataJson: { reason: input.reason } as Prisma.InputJsonValue,
      },
    }),
  ]);
  return { ok: true };
}

export type ChangeStatusInput = {
  userId: string;
  performedById?: string | null;
  mappingId: string;
  status: ProductMappingStatus;
  internalProductId?: string | null;
};

export async function changeMappingStatus(input: ChangeStatusInput): Promise<{ ok: boolean; error?: string }> {
  const mappingWhere = await productMappingByIdWhereForOwner(input.userId, input.mappingId);
  const existingSelect = { id: true, status: true, internalProductId: true } as const;

  let existing: Awaited<ReturnType<typeof prisma.productMapping.findFirst<{ select: typeof existingSelect }>>>;
  if (input.internalProductId) {
    const productWhere = await productByIdWhereForOwner(input.userId, input.internalProductId);
    const [mapping, product] = await Promise.all([
      prisma.productMapping.findFirst({ where: mappingWhere, select: existingSelect }),
      prisma.product.findFirst({ where: productWhere, select: { id: true } }),
    ]);
    existing = mapping;
    if (!product) return { ok: false, error: "Product is not in this workspace." };
  } else {
    existing = await prisma.productMapping.findFirst({ where: mappingWhere, select: existingSelect });
  }
  if (!existing) return { ok: false, error: "Mapping not found" };

  await prisma.$transaction([
    prisma.productMapping.update({
      where: { id: input.mappingId },
      data: {
        status: input.status,
        internalProductId:
          input.internalProductId !== undefined ? input.internalProductId : existing.internalProductId,
      },
    }),
    prisma.productMappingEvent.create({
      data: {
        userId: input.userId,
        mappingId: input.mappingId,
        eventType: "CHANGED",
        performedById: input.performedById ?? undefined,
        metadataJson: {
          from: existing.status,
          to: input.status,
          internalProductId: input.internalProductId ?? existing.internalProductId,
        } as Prisma.InputJsonValue,
      },
    }),
  ]);
  return { ok: true };
}

export type BulkApproveInput = {
  userId: string;
  performedById?: string | null;
  mappingIds: string[];
};

export type BulkApproveOutcome = {
  approved: number;
  skipped: number;
  notes: string[];
};

export async function bulkApproveSafe(input: BulkApproveInput): Promise<BulkApproveOutcome> {
  const rows = await prisma.productMapping.findMany({
    where: await mappingScopeAnd(input.userId, { id: { in: input.mappingIds } }),
    select: {
      id: true,
      confidenceLabel: true,
      internalProductId: true,
      status: true,
      externalTitle: true,
    },
  });

  const notes: string[] = [];
  let approved = 0;
  let skipped = 0;
  for (const row of rows) {
    if (!isBulkApprovable(row.confidenceLabel)) {
      skipped += 1;
      notes.push(`${row.externalTitle}: confidence ${row.confidenceLabel ?? "NONE"} not eligible for bulk approval`);
      continue;
    }
    if (!row.internalProductId) {
      skipped += 1;
      notes.push(`${row.externalTitle}: no candidate attached`);
      continue;
    }
    if (row.status === "APPROVED" || row.status === "CONFIRMED") {
      skipped += 1;
      continue;
    }

    await prisma.$transaction([
      prisma.productMapping.update({
        where: { id: row.id },
        data: {
          status: "APPROVED",
          approvedById: input.performedById ?? undefined,
          approvedAt: new Date(),
        },
      }),
      prisma.productMappingEvent.create({
        data: {
          userId: input.userId,
          mappingId: row.id,
          eventType: "BULK_APPLIED",
          performedById: input.performedById ?? undefined,
          metadataJson: { action: "approve", confidence: row.confidenceLabel } as Prisma.InputJsonValue,
        },
      }),
    ]);
    approved += 1;
  }

  return { approved, skipped, notes };
}

export type ArchiveInput = {
  userId: string;
  performedById?: string | null;
  mappingIds: string[];
};

export async function bulkArchive(input: ArchiveInput): Promise<{ archived: number }> {
  if (input.mappingIds.length === 0) return { archived: 0 };
  const scope = await mappingScopeAnd(input.userId, { id: { in: input.mappingIds } });
  const [result] = await Promise.all([
    prisma.productMapping.updateMany({
      where: scope,
      data: { status: "ARCHIVED" },
    }),
    prisma.productMappingEvent.createMany({
      data: input.mappingIds.map((mappingId) => ({
        userId: input.userId,
        mappingId,
        eventType: "ARCHIVED" as ProductMappingEventType,
        performedById: input.performedById ?? undefined,
      })),
    }),
  ]);
  return { archived: result.count };
}

export type BulkIgnoreInput = {
  userId: string;
  performedById?: string | null;
  mappingIds: string[];
};

export async function bulkIgnore(input: BulkIgnoreInput): Promise<{ ignored: number }> {
  if (input.mappingIds.length === 0) return { ignored: 0 };
  const scope = await mappingScopeAnd(input.userId, { id: { in: input.mappingIds } });
  const [result] = await Promise.all([
    prisma.productMapping.updateMany({
      where: scope,
      data: { status: "IGNORED" },
    }),
    prisma.productMappingEvent.createMany({
      data: input.mappingIds.map((mappingId) => ({
        userId: input.userId,
        mappingId,
        eventType: "CHANGED" as ProductMappingEventType,
        performedById: input.performedById ?? undefined,
        metadataJson: { to: "IGNORED" } as Prisma.InputJsonValue,
      })),
    }),
  ]);
  return { ignored: result.count };
}

export type CreateAliasInput = {
  userId: string;
  performedById?: string | null;
  externalTitle: string;
  internalProductId: string;
  provider?: ProductMappingProvider | null;
  brandId?: string | null;
};

export async function createAlias(input: CreateAliasInput) {
  const normalized = input.externalTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) return { ok: false as const, error: "External title is required" };
  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  const alias = await prisma.productMappingAlias.create({
    data: {
      userId: input.userId,
      workspaceId,
      externalTitle: input.externalTitle,
      normalizedTitle: normalized,
      internalProductId: input.internalProductId,
      provider: input.provider ?? undefined,
      brandId: input.brandId ?? undefined,
    },
  });
  await prisma.productMappingEvent.create({
    data: {
      userId: input.userId,
      eventType: "ALIAS_CREATED",
      performedById: input.performedById ?? undefined,
      metadataJson: {
        aliasId: alias.id,
        normalizedTitle: normalized,
        internalProductId: input.internalProductId,
      } as Prisma.InputJsonValue,
    },
  });
  return { ok: true as const, alias };
}

export type CreateModifierInput = {
  userId: string;
  performedById?: string | null;
  productMappingId: string;
  provider: ProductMappingProvider;
  externalModifierId?: string | null;
  externalModifierName: string;
  externalOptionName?: string | null;
  internalModifierKey?: string | null;
  internalOptionValue?: string | null;
  status?: ProductModifierMappingStatus;
};

export async function upsertModifierMapping(input: CreateModifierInput) {
  const ownerWhere = await productMappingByIdWhereForOwner(input.userId, input.productMappingId);
  const modifierWhere = {
    productMappingId: input.productMappingId,
    externalModifierName: input.externalModifierName,
    externalOptionName: input.externalOptionName ?? null,
  };
  const [owns, existing] = await Promise.all([
    prisma.productMapping.findFirst({ where: ownerWhere, select: { id: true } }),
    prisma.productModifierMapping.findFirst({ where: modifierWhere }),
  ]);
  if (!owns) return { ok: false as const, error: "Mapping not found" };
  const data = {
    productMappingId: input.productMappingId,
    provider: input.provider,
    externalModifierId: input.externalModifierId ?? null,
    externalModifierName: input.externalModifierName,
    externalOptionName: input.externalOptionName ?? null,
    internalModifierKey: input.internalModifierKey ?? null,
    internalOptionValue: input.internalOptionValue ?? null,
    status:
      input.status ??
      (input.internalModifierKey ? ("APPROVED" as ProductModifierMappingStatus) : ("SUGGESTED" as ProductModifierMappingStatus)),
  };
  const row = await prisma.$transaction(async (tx) => {
    const saved = existing
      ? await tx.productModifierMapping.update({ where: { id: existing.id }, data })
      : await tx.productModifierMapping.create({ data });
    await tx.productMappingEvent.create({
      data: {
        userId: input.userId,
        mappingId: input.productMappingId,
        eventType: "MODIFIER_MAPPED",
        performedById: input.performedById ?? undefined,
        metadataJson: {
          modifierId: saved.id,
          key: saved.internalModifierKey,
          option: saved.internalOptionValue,
        } as Prisma.InputJsonValue,
      },
    });
    return saved;
  });
  return { ok: true as const, modifier: row };
}

export type MappingFilters = {
  status?: ProductMappingStatus | ProductMappingStatus[];
  providerKey?: ProductMappingProvider;
  confidenceLabel?: ProductMappingConfidence | ProductMappingConfidence[];
  search?: string;
  take?: number;
};

export async function listMappings(userId: string, filters: MappingFilters = {}) {
  const statusFilter = filters.status
    ? Array.isArray(filters.status)
      ? { in: filters.status }
      : filters.status
    : undefined;
  const confidenceFilter = filters.confidenceLabel
    ? Array.isArray(filters.confidenceLabel)
      ? { in: filters.confidenceLabel }
      : filters.confidenceLabel
    : undefined;

  const scope = await productMappingListWhereForOwner(userId);
  return prisma.productMapping.findMany({
    where: {
      AND: [
        scope,
        ...(statusFilter ? [{ status: statusFilter }] : []),
        ...(filters.providerKey ? [{ providerKey: filters.providerKey }] : []),
        ...(confidenceFilter ? [{ confidenceLabel: confidenceFilter }] : []),
        ...(filters.search
          ? [
              {
                OR: [
                  { externalTitle: { contains: filters.search, mode: "insensitive" as const } },
                  { externalSku: { contains: filters.search, mode: "insensitive" as const } },
                  { externalProductId: { contains: filters.search, mode: "insensitive" as const } },
                ],
              },
            ]
          : []),
      ],
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      internalProduct: { select: { id: true, title: true } },
      approvedBy: { select: { id: true, fullName: true, email: true } },
      modifierMappings: { take: 20 },
    },
    take: filters.take ?? 100,
  });
}

export async function listAliases(userId: string, take = 100) {
  const scope = await productMappingAliasListWhereForOwner(userId);
  return prisma.productMappingAlias.findMany({
    where: { AND: [scope, { active: true }] },
    orderBy: { updatedAt: "desc" },
    take,
    include: { internalProduct: { select: { id: true, title: true } } },
  });
}

export async function listEvents(userId: string, take = 50) {
  const scope = await resolveOwnerScopedWhere(userId);
  return prisma.productMappingEvent.findMany({
    where: scope,
    orderBy: { createdAt: "desc" },
    take,
    include: {
      performedBy: { select: { id: true, fullName: true, email: true } },
      mapping: { select: { id: true, externalTitle: true } },
    },
  });
}

export async function listImportBatches(userId: string, take = 50) {
  const scope = await resolveOwnerScopedWhere(userId);
  return prisma.productMappingImportBatch.findMany({
    where: scope,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function workbenchKpis(userId: string): Promise<{
  unmapped: number;
  suggested: number;
  needsReview: number;
  approved: number;
  conflicts: number;
  providersConnected: number;
  lastSyncAt: Date | null;
}> {
  const [mappingScope, integrationWhere] = await Promise.all([
    productMappingListWhereForOwner(userId),
    integrationConnectionListWhereForOwner(userId),
  ]);
  const [unmapped, suggested, needsReview, approved, conflicts, providers, lastSync] = await Promise.all([
    prisma.productMapping.count({ where: { AND: [mappingScope, { status: "UNMAPPED" }] } }),
    prisma.productMapping.count({ where: { AND: [mappingScope, { status: "SUGGESTED" }] } }),
    prisma.productMapping.count({ where: { AND: [mappingScope, { status: "NEEDS_REVIEW" }] } }),
    prisma.productMapping.count({
      where: { AND: [mappingScope, { status: { in: ["APPROVED", "CONFIRMED"] } }] },
    }),
    prisma.productMapping.count({ where: { AND: [mappingScope, { status: "CONFLICT" }] } }),
    prisma.integrationConnection.count({ where: integrationWhere }),
    prisma.integrationConnection.findFirst({
      where: { AND: [integrationWhere, { lastSyncAt: { not: null } }] },
      orderBy: { lastSyncAt: "desc" },
      select: { lastSyncAt: true },
    }),
  ]);
  return {
    unmapped,
    suggested,
    needsReview,
    approved,
    conflicts,
    providersConnected: providers,
    lastSyncAt: lastSync?.lastSyncAt ?? null,
  };
}

export async function detectConflicts(userId: string): Promise<{
  duplicateInternalTargets: { internalProductId: string; mappings: ProductMapping[] }[];
  duplicateExternal: { externalProductId: string; mappings: ProductMapping[] }[];
}> {
  const approved = await prisma.productMapping.findMany({
    where: await mappingScopeAnd(userId, {
      status: { in: ["APPROVED", "CONFIRMED"] },
      internalProductId: { not: null },
    }),
  });
  const byInternal = new Map<string, ProductMapping[]>();
  const byExternal = new Map<string, ProductMapping[]>();
  for (const m of approved) {
    if (m.internalProductId) {
      const arr = byInternal.get(m.internalProductId) ?? [];
      arr.push(m);
      byInternal.set(m.internalProductId, arr);
    }
    const arr = byExternal.get(m.externalProductId) ?? [];
    arr.push(m);
    byExternal.set(m.externalProductId, arr);
  }
  return {
    duplicateInternalTargets: [...byInternal.entries()]
      .filter(([, arr]) => arr.length > 1)
      .map(([internalProductId, mappings]) => ({ internalProductId, mappings })),
    duplicateExternal: [...byExternal.entries()]
      .filter(([, arr]) => arr.length > 1)
      .map(([externalProductId, mappings]) => ({ externalProductId, mappings })),
  };
}

export async function loadMatchableCandidates(userId: string): Promise<{ id: string; title: string }[]> {
  const rows = await loadCandidates(userId);
  return rows.map((r) => ({ id: r.id, title: r.title }));
}

export const BULK_APPROVABLE_LABELS = BULK_APPROVABLE;
