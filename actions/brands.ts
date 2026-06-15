"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { asVoidFormAction } from "@/lib/actions/server-form-action";
import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { slugifyBrandSlug } from "@/lib/brands/brand-helpers";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import type { BrandConceptKind, BrandLifecycleStatus, BusinessType, MenuStrategy, Prisma } from "@prisma/client";
import { BusinessType as BusinessTypeEnum } from "@prisma/client";

const conceptKindSchema = z.enum([
  "RESTAURANT_CONCEPT",
  "CAFE_CONCEPT",
  "BAR_CONCEPT",
  "BAKERY_CONCEPT",
  "CATERING_BRAND",
  "MEAL_PREP_BRAND",
  "GHOST_KITCHEN_BRAND",
  "CLOUD_KITCHEN_BRAND",
  "EVENT_BRAND",
  "RETAIL_BRAND",
  "OTHER",
]);

const menuStrategySchema = z.enum([
  "WEEKLY_PREORDER",
  "DAILY_MENU",
  "RESTAURANT_MENU",
  "CAFE_SPECIALS",
  "DRINKS_MENU",
  "BAKERY_PREORDER",
  "CATERING_PACKAGES",
  "EVENT_MENU",
  "SEASONAL_MENU",
  "MULTI_BRAND_MENU",
]);

const businessTypeSchema = z.nativeEnum(BusinessTypeEnum);

function tok(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  if (v == null) return undefined;
  const t = String(v).trim();
  return t.length ? t : undefined;
}

async function requireBrandMutationAccess(operation: string) {
  const access = await requireMutationPermission("workspace.settings");
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "brands.permission_denied",
      entityType: "Brand",
      metadata: { operation, requiredPermission: "workspace.settings" },
    });
    return { ok: false as const, error: access.error };
  }
  const { sessionUser: user, dataUserId } = await requireTenantActor();
  return { ok: true as const, sessionUser: user, dataUserId };
}

const brandCreateSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional().or(z.literal("")),
  brandColor: z.string().max(32).optional().or(z.literal("")),
  secondaryColor: z.string().max(32).optional().or(z.literal("")),
  conceptKind: conceptKindSchema.optional(),
  lifecycleStatus: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
  positioning: z.string().max(4000).optional().or(z.literal("")),
  customerSegment: z.string().max(255).optional().or(z.literal("")),
  logoUrl: z.string().max(2048).optional().or(z.literal("")),
  faviconUrl: z.string().max(2048).optional().or(z.literal("")),
  coverImageUrl: z.string().max(2048).optional().or(z.literal("")),
  websiteUrl: z.string().max(512).optional().or(z.literal("")),
  brandCustomDomain: z.string().max(255).optional().or(z.literal("")),
  contactEmail: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().email().max(255).optional(),
  ),
  contactPhone: z.string().max(64).optional().or(z.literal("")),
  seoTitle: z.string().max(255).optional().or(z.literal("")),
  seoDescription: z.string().max(2000).optional().or(z.literal("")),
  seoImageUrl: z.string().max(2048).optional().or(z.literal("")),
  defaultBusinessMode: z.string().max(32).optional().or(z.literal("")),
  storefrontTemplate: z.string().max(120).optional().or(z.literal("")),
  menuStrategy: z.string().max(64).optional().or(z.literal("")),
  productionNotes: z.string().max(4000).optional().or(z.literal("")),
  salesChannelNotes: z.string().max(4000).optional().or(z.literal("")),
});

export async function createBrand(
  formData: FormData,
): Promise<{ ok: true; id: string } | { error: string }> {
  try {
    const manage = await requireBrandMutationAccess("brands.create");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser: user, dataUserId } = manage;
    const rawSlug = String(formData.get("slug") ?? "");
    const slug = slugifyBrandSlug(rawSlug.length ? rawSlug : String(formData.get("name") ?? "brand"));

    const defaultBusinessRaw = tok(formData, "defaultBusinessMode");
    const defaultBusinessParsed = defaultBusinessRaw
      ? businessTypeSchema.safeParse(defaultBusinessRaw)
      : null;
    const defaultBusinessMode: BusinessType | undefined =
      defaultBusinessParsed && defaultBusinessParsed.success ? defaultBusinessParsed.data : undefined;

    const menuStrategyRaw = tok(formData, "menuStrategy");
    const menuStrategyParsed = menuStrategyRaw ? menuStrategySchema.safeParse(menuStrategyRaw) : null;
    const menuStrategy: MenuStrategy | undefined =
      menuStrategyParsed && menuStrategyParsed.success ? menuStrategyParsed.data : undefined;

    const parsed = brandCreateSchema.safeParse({
      name: formData.get("name"),
      slug,
      description: formData.get("description"),
      brandColor: formData.get("brandColor"),
      secondaryColor: formData.get("secondaryColor"),
      conceptKind: formData.get("conceptKind")?.toString().trim() || undefined,
      lifecycleStatus: formData.get("lifecycleStatus")?.toString().trim() || undefined,
      positioning: formData.get("positioning"),
      customerSegment: formData.get("customerSegment"),
      logoUrl: formData.get("logoUrl"),
      faviconUrl: formData.get("faviconUrl"),
      coverImageUrl: formData.get("coverImageUrl"),
      websiteUrl: formData.get("websiteUrl"),
      brandCustomDomain: formData.get("brandCustomDomain"),
      contactEmail: formData.get("contactEmail"),
      contactPhone: formData.get("contactPhone"),
      seoTitle: formData.get("seoTitle"),
      seoDescription: formData.get("seoDescription"),
      seoImageUrl: formData.get("seoImageUrl"),
      defaultBusinessMode: defaultBusinessRaw ?? "",
      storefrontTemplate: formData.get("storefrontTemplate"),
      menuStrategy: formData.get("menuStrategy"),
      productionNotes: formData.get("productionNotes"),
      salesChannelNotes: formData.get("salesChannelNotes"),
    });
    if (!parsed.success) return { error: "Please check brand fields." };
    if (defaultBusinessRaw && !defaultBusinessParsed?.success) {
      return { error: "Invalid business mode." };
    }
    if (menuStrategyRaw && !menuStrategyParsed?.success) {
      return { error: "Invalid menu strategy." };
    }

    let workspace = await prisma.workspace.findFirst({
      where: { ownerUserId: user.id },
      orderBy: { createdAt: "asc" },
    });
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { ownerUserId: user.id, name: "Default workspace", type: "BUSINESS" },
      });
    }

    const d = parsed.data;

    const fulfillment: Record<string, unknown> = {};
    const st = d.storefrontTemplate?.trim();
    if (st) fulfillment.storefrontTemplate = st;
    if (menuStrategy) fulfillment.menuStrategy = menuStrategy;
    const scNotes = d.salesChannelNotes?.trim();
    if (scNotes) fulfillment.salesChannelNotes = scNotes;

    const production: Record<string, unknown> = {};
    const pn = d.productionNotes?.trim();
    if (pn) production.wizardNotes = pn;

    const data: Prisma.BrandCreateInput = {
      workspace: { connect: { id: workspace.id } },
      name: d.name.trim(),
      slug: d.slug,
      description: d.description?.trim() || null,
      brandColor: d.brandColor?.trim() || null,
      secondaryColor: d.secondaryColor?.trim() || null,
      conceptKind: (d.conceptKind ?? "OTHER") as BrandConceptKind,
      lifecycleStatus: (d.lifecycleStatus ?? "ACTIVE") as BrandLifecycleStatus,
      positioning: d.positioning?.trim() || null,
      customerSegment: d.customerSegment?.trim() || null,
      logoUrl: d.logoUrl?.trim() || null,
      faviconUrl: d.faviconUrl?.trim() || null,
      coverImageUrl: d.coverImageUrl?.trim() || null,
      websiteUrl: d.websiteUrl?.trim() || null,
      brandCustomDomain: d.brandCustomDomain?.trim() || null,
      contactEmail: d.contactEmail?.trim() || null,
      contactPhone: d.contactPhone?.trim() || null,
      seoTitle: d.seoTitle?.trim() || null,
      seoDescription: d.seoDescription?.trim() || null,
      seoImageUrl: d.seoImageUrl?.trim() || null,
      defaultBusinessMode: defaultBusinessMode ?? null,
      fulfillmentSettingsJson:
        Object.keys(fulfillment).length > 0 ? (fulfillment as Prisma.InputJsonValue) : undefined,
      productionSettingsJson:
        Object.keys(production).length > 0 ? (production as Prisma.InputJsonValue) : undefined,
    };

    const brand = await prisma.brand.create({ data });
    await recordAuditLog({
      workspaceId: workspace.id,
      userId: dataUserId,
      action: "brand.created",
      entityType: "Brand",
      entityId: brand.id,
      metadata: { name: brand.name, slug: brand.slug },
    });
    revalidatePath("/dashboard/brands");
    revalidatePath("/dashboard");
    return { ok: true as const, id: brand.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

const brandUpdateSchema = z.object({
  brandId: z.string().uuid(),
  name: z.string().min(2).max(255).optional(),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(2000).optional().or(z.literal("")),
  positioning: z.string().max(4000).optional().or(z.literal("")),
  customerSegment: z.string().max(255).optional().or(z.literal("")),
  brandColor: z.string().max(32).optional().or(z.literal("")),
  secondaryColor: z.string().max(32).optional().or(z.literal("")),
  logoUrl: z.string().max(2048).optional().or(z.literal("")),
  faviconUrl: z.string().max(2048).optional().or(z.literal("")),
  coverImageUrl: z.string().max(2048).optional().or(z.literal("")),
  websiteUrl: z.string().max(512).optional().or(z.literal("")),
  brandCustomDomain: z.string().max(255).optional().or(z.literal("")),
  contactEmail: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().email().max(255).optional(),
  ),
  contactPhone: z.string().max(64).optional().or(z.literal("")),
  seoTitle: z.string().max(255).optional().or(z.literal("")),
  seoDescription: z.string().max(2000).optional().or(z.literal("")),
  seoImageUrl: z.string().max(2048).optional().or(z.literal("")),
  defaultBusinessMode: z.string().max(32).optional().or(z.literal("")),
});

export async function updateBrandDetails(formData: FormData) {
  try {
    const manage = await requireBrandMutationAccess("brands.update_details");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser: user, dataUserId } = manage;
    const brandId = String(formData.get("brandId") ?? "");
    if (!brandId) return { error: "Missing brand" };

    const defaultBusinessModeKeyPresent = [...formData.keys()].includes("defaultBusinessMode");
    const defaultBusinessRawValue = formData.get("defaultBusinessMode");
    const defaultBusinessRaw =
      defaultBusinessRawValue == null ? undefined : String(defaultBusinessRawValue).trim();
    const defaultBusinessParsed = defaultBusinessRaw
      ? businessTypeSchema.safeParse(defaultBusinessRaw)
      : null;

    const rawSlug = tok(formData, "slug");
    const slug = rawSlug ? slugifyBrandSlug(rawSlug) : undefined;

    const parsed = brandUpdateSchema.safeParse({
      brandId,
      name: tok(formData, "name"),
      slug,
      description: formData.get("description"),
      positioning: formData.get("positioning"),
      customerSegment: formData.get("customerSegment"),
      brandColor: formData.get("brandColor"),
      secondaryColor: formData.get("secondaryColor"),
      logoUrl: formData.get("logoUrl"),
      faviconUrl: formData.get("faviconUrl"),
      coverImageUrl: formData.get("coverImageUrl"),
      websiteUrl: formData.get("websiteUrl"),
      brandCustomDomain: formData.get("brandCustomDomain"),
      contactEmail: formData.get("contactEmail"),
      contactPhone: formData.get("contactPhone"),
      seoTitle: formData.get("seoTitle"),
      seoDescription: formData.get("seoDescription"),
      seoImageUrl: formData.get("seoImageUrl"),
      defaultBusinessMode: defaultBusinessRaw ?? "",
    });
    if (!parsed.success) return { error: "Please check brand fields." };
    if (defaultBusinessRaw && !defaultBusinessParsed?.success) {
      return { error: "Invalid business mode." };
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, workspace: { ownerUserId: user.id } },
    });
    if (!brand) return { error: "Brand not found" };

    const d = parsed.data;
    const data: Prisma.BrandUpdateInput = {};
    if (d.name != null) data.name = d.name.trim();
    if (d.slug != null) data.slug = d.slug;
    if (d.description !== undefined) data.description = d.description?.trim() || null;
    if (d.positioning !== undefined) data.positioning = d.positioning?.trim() || null;
    if (d.customerSegment !== undefined) data.customerSegment = d.customerSegment?.trim() || null;
    if (d.brandColor !== undefined) data.brandColor = d.brandColor?.trim() || null;
    if (d.secondaryColor !== undefined) data.secondaryColor = d.secondaryColor?.trim() || null;
    if (d.logoUrl !== undefined) data.logoUrl = d.logoUrl?.trim() || null;
    if (d.faviconUrl !== undefined) data.faviconUrl = d.faviconUrl?.trim() || null;
    if (d.coverImageUrl !== undefined) data.coverImageUrl = d.coverImageUrl?.trim() || null;
    if (d.websiteUrl !== undefined) data.websiteUrl = d.websiteUrl?.trim() || null;
    if (d.brandCustomDomain !== undefined) data.brandCustomDomain = d.brandCustomDomain?.trim() || null;
    if (d.contactEmail !== undefined) data.contactEmail = d.contactEmail?.trim() || null;
    if (d.contactPhone !== undefined) data.contactPhone = d.contactPhone?.trim() || null;
    if (d.seoTitle !== undefined) data.seoTitle = d.seoTitle?.trim() || null;
    if (d.seoDescription !== undefined) data.seoDescription = d.seoDescription?.trim() || null;
    if (d.seoImageUrl !== undefined) data.seoImageUrl = d.seoImageUrl?.trim() || null;
    if (defaultBusinessModeKeyPresent) {
      if (!defaultBusinessRaw) {
        data.defaultBusinessMode = null;
      } else if (defaultBusinessParsed?.success) {
        data.defaultBusinessMode = defaultBusinessParsed.data;
      }
    }

    if (Object.keys(data).length === 0) return { error: "Nothing to update" };

    await prisma.brand.update({
      where: { id: brand.id },
      data,
    });
    await recordAuditLog({
      workspaceId: brand.workspaceId,
      userId: dataUserId,
      action: "brand.updated",
      entityType: "Brand",
      entityId: brand.id,
      metadata: { fields: Object.keys(data) },
    });
    revalidatePath("/dashboard/brands");
    revalidatePath(`/dashboard/brands/${brand.id}`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateBrandDetailsFormAction(formData: FormData): Promise<void> {
  void (await updateBrandDetails(formData));
}

export async function updateBrandLifecycle(formData: FormData) {
  try {
    const manage = await requireBrandMutationAccess("brands.update_lifecycle");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser: user, dataUserId } = manage;
    const brandId = String(formData.get("brandId") ?? "");
    const next = String(formData.get("lifecycleStatus") ?? "").trim();
    const parsed = z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"]).safeParse(next);
    if (!brandId || !parsed.success) return { error: "Invalid request" };

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, workspace: { ownerUserId: user.id } },
    });
    if (!brand) return { error: "Brand not found" };

    await prisma.brand.update({
      where: { id: brand.id },
      data: { lifecycleStatus: parsed.data as BrandLifecycleStatus },
    });
    await recordAuditLog({
      workspaceId: brand.workspaceId,
      userId: dataUserId,
      action: "brand.lifecycle_updated",
      entityType: "Brand",
      entityId: brand.id,
      metadata: { lifecycleStatus: parsed.data },
    });
    revalidatePath("/dashboard/brands");
    revalidatePath(`/dashboard/brands/${brand.id}`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateBrandLifecycleFormAction(formData: FormData): Promise<void> {
  void (await updateBrandLifecycle(formData));
}

export const createBrandFormAction = asVoidFormAction(createBrand);
