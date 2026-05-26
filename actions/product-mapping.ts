"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { asVoidFormAction } from "@/lib/actions/server-form-action";
import { requireUserProfile } from "@/lib/auth";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";

import {
  canUseProductMapping,
  type ProductMappingActorScope,
  type ProductMappingCapability,
} from "@/lib/product-mapping/mapping-permissions";
import {
  approveMapping,
  bulkApproveSafe,
  bulkArchive,
  bulkIgnore,
  changeMappingStatus,
  createAlias,
  createOrUpdateMapping,
  rejectMapping,
  upsertModifierMapping,
} from "@/services/product-mapping/product-mapping-service";
import type { ProductMappingProvider, ProductModifierMappingStatus } from "@prisma/client";

function scopeFrom(profile: { role: string | null; email: string | null }): ProductMappingActorScope {
  return { isOwner: true, role: profile.role, email: profile.email };
}

async function assertCapability(cap: ProductMappingCapability) {
  const { sessionUser: user, dataUserId } = await requireTenantActor();
  const profile = await requireUserProfile();
  const scope = scopeFrom({ role: profile.role ?? null, email: profile.email ?? null });
  if (!canUseProductMapping(scope, cap)) {
    throw new Error(`You do not have permission to ${cap}.`);
  }
  return { userId: dataUserId, profileId: profile.id };
}

const PROVIDER_KEYS = [
  "SHOPIFY",
  "WOOCOMMERCE",
  "UBER_EATS",
  "UBER_DIRECT",
  "CSV",
  "STOREFRONT",
  "MANUAL",
  "DOORDASH_PLACEHOLDER",
  "CUSTOM",
] as const;

const MODIFIER_STATUS_VALUES = ["UNMAPPED", "SUGGESTED", "APPROVED", "REJECTED", "IGNORED"] as const;

const STATUS_VALUES = [
  "UNMAPPED",
  "SUGGESTED",
  "NEEDS_REVIEW",
  "APPROVED",
  "CONFIRMED",
  "REJECTED",
  "IGNORED",
  "CONFLICT",
  "ARCHIVED",
] as const;

const createSchema = z.object({
  provider: z.string().min(1).max(120),
  externalProductId: z.string().max(255).optional().default(""),
  externalSku: z.string().max(255).optional(),
  externalTitle: z.string().min(1).max(512),
  externalVariantId: z.string().max(255).optional(),
  externalVariantTitle: z.string().max(512).optional(),
  externalCategory: z.string().max(255).optional(),
  brandId: z.string().uuid().optional().nullable(),
  locationId: z.string().uuid().optional().nullable(),
  salesChannelId: z.string().uuid().optional().nullable(),
});

export async function createMappingSuggestionAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await assertCapability("mapping.create");
  const parsed = createSchema.parse({
    provider: formData.get("provider") ?? "CSV",
    externalProductId: formData.get("externalProductId") ?? "",
    externalSku: formData.get("externalSku") ?? undefined,
    externalTitle: formData.get("externalTitle"),
    externalVariantId: formData.get("externalVariantId") ?? undefined,
    externalVariantTitle: formData.get("externalVariantTitle") ?? undefined,
    externalCategory: formData.get("externalCategory") ?? undefined,
    brandId: (formData.get("brandId") as string) || null,
    locationId: (formData.get("locationId") as string) || null,
    salesChannelId: (formData.get("salesChannelId") as string) || null,
  });
  const result = await createOrUpdateMapping({
    userId,
    performedById: profileId,
    provider: parsed.provider,
    externalProductId: parsed.externalProductId,
    externalSku: parsed.externalSku ?? null,
    externalTitle: parsed.externalTitle,
    externalVariantId: parsed.externalVariantId ?? null,
    externalVariantTitle: parsed.externalVariantTitle ?? null,
    externalCategory: parsed.externalCategory ?? null,
    brandId: parsed.brandId ?? null,
    locationId: parsed.locationId ?? null,
    salesChannelId: parsed.salesChannelId ?? null,
  });
  if (!result.ok) throw new Error(result.error);
  revalidatePath("/dashboard/product-mapping");
}

const updateStatusSchema = z.object({
  mappingId: z.string().uuid(),
  status: z.enum(STATUS_VALUES),
  internalProductId: z.string().uuid().nullable().optional(),
});

/** Form action for `/dashboard/product-mapping` status updates. */
export async function updateProductMappingStatusForm(formData: FormData): Promise<void> {
  const { userId, profileId } = await assertCapability("mapping.edit");
  const parsed = updateStatusSchema.parse({
    mappingId: formData.get("mappingId"),
    status: formData.get("status"),
    internalProductId: (formData.get("internalProductId") as string) || null,
  });
  const result = await changeMappingStatus({
    userId,
    performedById: profileId,
    mappingId: parsed.mappingId,
    status: parsed.status,
    internalProductId: parsed.internalProductId ?? null,
  });
  if (!result.ok) throw new Error(result.error ?? "Could not update mapping status.");
  revalidatePath("/dashboard/product-mapping");
}

const approveSchema = z.object({
  mappingId: z.string().uuid(),
  internalProductId: z.string().uuid().nullable().optional(),
  confirm: z.literal(true),
});

export async function approveMappingAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await assertCapability("mapping.approve");
  const parsed = approveSchema.parse({
    mappingId: formData.get("mappingId"),
    internalProductId: (formData.get("internalProductId") as string) || null,
    confirm: formData.get("confirm") === "true",
  });
  const result = await approveMapping({
    userId,
    performedById: profileId,
    mappingId: parsed.mappingId,
    internalProductId: parsed.internalProductId ?? null,
  });
  if (!result.ok) throw new Error(result.error ?? "Could not approve mapping.");
  revalidatePath("/dashboard/product-mapping");
}

const rejectSchema = z.object({
  mappingId: z.string().uuid(),
  reason: z.string().min(2).max(800),
  confirm: z.literal(true),
});

export async function rejectMappingAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await assertCapability("mapping.reject");
  const parsed = rejectSchema.parse({
    mappingId: formData.get("mappingId"),
    reason: formData.get("reason") ?? "",
    confirm: formData.get("confirm") === "true",
  });
  const result = await rejectMapping({
    userId,
    performedById: profileId,
    mappingId: parsed.mappingId,
    reason: parsed.reason,
  });
  if (!result.ok) throw new Error(result.error ?? "Could not reject mapping.");
  revalidatePath("/dashboard/product-mapping");
}

const bulkSchema = z.object({
  mappingIds: z.array(z.string().uuid()).min(1),
  confirm: z.literal(true),
});

function parseMappingIds(formData: FormData): string[] {
  const ids = formData.getAll("mappingIds").map((v) => String(v));
  return ids;
}

export async function bulkApproveSafeAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await assertCapability("mapping.bulk");
  const parsed = bulkSchema.parse({
    mappingIds: parseMappingIds(formData),
    confirm: formData.get("confirm") === "true",
  });
  const outcome = await bulkApproveSafe({
    userId,
    performedById: profileId,
    mappingIds: parsed.mappingIds,
  });
  if (outcome.approved === 0) {
    throw new Error(outcome.notes[0] ?? "No mappings were eligible for bulk approval.");
  }
  revalidatePath("/dashboard/product-mapping");
}

export async function bulkArchiveAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await assertCapability("mapping.archive");
  const parsed = bulkSchema.parse({
    mappingIds: parseMappingIds(formData),
    confirm: formData.get("confirm") === "true",
  });
  await bulkArchive({
    userId,
    performedById: profileId,
    mappingIds: parsed.mappingIds,
  });
  revalidatePath("/dashboard/product-mapping");
}

export async function bulkIgnoreAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await assertCapability("mapping.bulk");
  const parsed = bulkSchema.parse({
    mappingIds: parseMappingIds(formData),
    confirm: formData.get("confirm") === "true",
  });
  await bulkIgnore({
    userId,
    performedById: profileId,
    mappingIds: parsed.mappingIds,
  });
  revalidatePath("/dashboard/product-mapping");
}

const aliasSchema = z.object({
  externalTitle: z.string().min(1).max(512),
  internalProductId: z.string().uuid(),
  provider: z.enum(PROVIDER_KEYS).nullable().optional(),
  brandId: z.string().uuid().nullable().optional(),
});

export async function createAliasAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await assertCapability("mapping.alias");
  const parsed = aliasSchema.parse({
    externalTitle: formData.get("externalTitle"),
    internalProductId: formData.get("internalProductId"),
    provider: (formData.get("provider") as string) || null,
    brandId: (formData.get("brandId") as string) || null,
  });
  const result = await createAlias({
    userId,
    performedById: profileId,
    externalTitle: parsed.externalTitle,
    internalProductId: parsed.internalProductId,
    provider: (parsed.provider as ProductMappingProvider | null) ?? null,
    brandId: parsed.brandId ?? null,
  });
  if (!result.ok) throw new Error(result.error ?? "Could not create alias.");
  revalidatePath("/dashboard/product-mapping");
}

const modifierSchema = z.object({
  productMappingId: z.string().uuid(),
  provider: z.enum(PROVIDER_KEYS),
  externalModifierId: z.string().max(255).optional().nullable(),
  externalModifierName: z.string().min(1).max(255),
  externalOptionName: z.string().max(255).optional().nullable(),
  internalModifierKey: z.string().max(255).optional().nullable(),
  internalOptionValue: z.string().max(255).optional().nullable(),
  status: z.enum(MODIFIER_STATUS_VALUES).optional(),
});

export async function upsertModifierAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await assertCapability("mapping.modifier");
  const parsed = modifierSchema.parse({
    productMappingId: formData.get("productMappingId"),
    provider: formData.get("provider"),
    externalModifierId: (formData.get("externalModifierId") as string) || null,
    externalModifierName: formData.get("externalModifierName"),
    externalOptionName: (formData.get("externalOptionName") as string) || null,
    internalModifierKey: (formData.get("internalModifierKey") as string) || null,
    internalOptionValue: (formData.get("internalOptionValue") as string) || null,
    status: (formData.get("status") as string) || undefined,
  });
  const result = await upsertModifierMapping({
    userId,
    performedById: profileId,
    productMappingId: parsed.productMappingId,
    provider: parsed.provider as ProductMappingProvider,
    externalModifierId: parsed.externalModifierId ?? null,
    externalModifierName: parsed.externalModifierName,
    externalOptionName: parsed.externalOptionName ?? null,
    internalModifierKey: parsed.internalModifierKey ?? null,
    internalOptionValue: parsed.internalOptionValue ?? null,
    status: parsed.status as ProductModifierMappingStatus | undefined,
  });
  if (!result.ok) throw new Error(result.error ?? "Could not save modifier mapping.");
  revalidatePath("/dashboard/product-mapping");
}

export const updateProductMappingStatusFormAction = updateProductMappingStatusForm;
