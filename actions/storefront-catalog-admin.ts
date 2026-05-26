"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { requireAdminStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { checkoutExtensionsSchema } from "@/lib/storefront/checkout-extensions";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import { resolveStorefrontAdminAccess } from "@/lib/storefront/storefront-admin-access";
import { safeError } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import {
  assertProductOnStorefront,
  getStorefrontCatalogAdminContext,
} from "@/services/storefront/storefront-catalog-admin-service";

async function ctx() {
  const { sessionUser: user } = await requireTenantActor();
  const access = await resolveStorefrontAdminAccess(user.id);
  if (!access.ok) throw new Error(access.error);
  if (!access.permissions.includes("storefront.catalog")) {
    throw new Error("You do not have permission to edit the catalog.");
  }
  const ownerUserId = access.storefront.userId;
  const data = await getStorefrontCatalogAdminContext(ownerUserId);
  if (!data) throw new Error("Save the storefront overview first.");
  const storefront = await prisma.storefrontSettings.findUnique({
    where: { id: access.storefront.id },
    select: {
      id: true,
      storeSlug: true,
      userId: true,
      workspaceId: true,
      activeMenuId: true,
      enabled: true,
      published: true,
    },
  });
  if (!storefront) throw new Error("Storefront not found.");
  return { user, access, storefront, ...data };
}

function revalidate(slug: string, storefrontId: string, ownerUserId: string) {
  revalidateStorefrontDashboardAndPublic(slug, "catalog", { storefrontId, ownerUserId });
  revalidatePath("/dashboard/storefront/catalog");
}

export async function upsertStorefrontVariantAction(formData: FormData) {
  try {
    const { storefront } = await ctx();
    const parsed = z
      .object({
        id: z.string().uuid().optional(),
        productId: z.string().uuid(),
        title: z.string().min(1).max(255),
        sku: z.string().max(64).optional(),
        priceAdjustment: z.coerce.number(),
        priceOverride: z.string().optional(),
        soldOut: z.coerce.boolean().optional(),
        active: z.coerce.boolean().optional(),
      })
      .safeParse({
        id: formData.get("id")?.toString() || undefined,
        productId: formData.get("productId")?.toString(),
        title: formData.get("title")?.toString(),
        sku: formData.get("sku")?.toString(),
        priceAdjustment: formData.get("priceAdjustment")?.toString() ?? "0",
        priceOverride: formData.get("priceOverride")?.toString(),
        soldOut: formData.get("soldOut") === "on",
        active: formData.get("active") !== "off",
      });
    if (!parsed.success) return { error: "Check variant fields." };

    await assertProductOnStorefront(storefront.id, parsed.data.productId);
    const overrideRaw = parsed.data.priceOverride?.trim();
    let priceOverride: number | null = null;
    if (overrideRaw) {
      const n = Number(overrideRaw);
      if (!Number.isFinite(n) || n < 0) return { error: "Price override is invalid." };
      priceOverride = n;
    }

    const payload = {
      title: parsed.data.title.trim(),
      sku: parsed.data.sku?.trim() || null,
      priceAdjustment: parsed.data.priceAdjustment,
      priceOverride,
      soldOut: parsed.data.soldOut ?? false,
      active: parsed.data.active ?? true,
    };

    if (parsed.data.id) {
      await prisma.storefrontProductVariant.updateMany({
        where: { id: parsed.data.id, storefrontId: storefront.id },
        data: payload,
      });
    } else {
      const maxSort = await prisma.storefrontProductVariant.aggregate({
        where: { storefrontId: storefront.id, productId: parsed.data.productId },
        _max: { sortOrder: true },
      });
      await prisma.storefrontProductVariant.create({
        data: {
          storefrontId: storefront.id,
          productId: parsed.data.productId,
          sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
          ...payload,
        },
      });
    }

    revalidate(storefront.storeSlug, storefront.id, storefront.userId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function deleteStorefrontVariantAction(formData: FormData) {
  try {
    const { storefront } = await ctx();
    const id = formData.get("id")?.toString();
    if (!id) return { error: "Missing variant id." };
    await prisma.storefrontProductVariant.deleteMany({
      where: { id, storefrontId: storefront.id },
    });
    revalidate(storefront.storeSlug, storefront.id, storefront.userId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function upsertStorefrontModifierGroupAction(formData: FormData) {
  try {
    const { storefront } = await ctx();
    const parsed = z
      .object({
        id: z.string().uuid().optional(),
        productId: z.string().uuid().optional().or(z.literal("")),
        name: z.string().min(1).max(120),
        required: z.coerce.boolean().optional(),
        minSelections: z.coerce.number().int().min(0).max(20),
        maxSelections: z.coerce.number().int().min(1).max(20),
        optionName: z.string().max(120).optional(),
        optionPrice: z.coerce.number().optional(),
      })
      .safeParse({
        id: formData.get("id")?.toString() || undefined,
        productId: formData.get("productId")?.toString(),
        name: formData.get("name")?.toString(),
        required: formData.get("required") === "on",
        minSelections: formData.get("minSelections")?.toString() ?? "0",
        maxSelections: formData.get("maxSelections")?.toString() ?? "1",
        optionName: formData.get("optionName")?.toString(),
        optionPrice: formData.get("optionPrice")?.toString() ?? "0",
      });
    if (!parsed.success) return { error: "Check modifier group fields." };

    const productId = parsed.data.productId?.trim() || null;
    if (productId) await assertProductOnStorefront(storefront.id, productId);

    let groupId = parsed.data.id;
    if (groupId) {
      await prisma.storefrontModifierGroup.updateMany({
        where: { id: groupId, storefrontId: storefront.id },
        data: {
          name: parsed.data.name.trim(),
          productId,
          required: parsed.data.required ?? false,
          minSelections: parsed.data.minSelections,
          maxSelections: parsed.data.maxSelections,
        },
      });
    } else {
      const maxSort = await prisma.storefrontModifierGroup.aggregate({
        where: { storefrontId: storefront.id },
        _max: { sortOrder: true },
      });
      const created = await prisma.storefrontModifierGroup.create({
        data: {
          storefrontId: storefront.id,
          productId,
          name: parsed.data.name.trim(),
          required: parsed.data.required ?? false,
          minSelections: parsed.data.minSelections,
          maxSelections: parsed.data.maxSelections,
          sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
        },
      });
      groupId = created.id;
    }

    const optName = parsed.data.optionName?.trim();
    if (optName && groupId) {
      await prisma.storefrontModifierOption.create({
        data: {
          groupId,
          name: optName,
          priceAdjustment: parsed.data.optionPrice ?? 0,
          sortOrder: 0,
        },
      });
    }

    revalidate(storefront.storeSlug, storefront.id, storefront.userId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function deleteStorefrontModifierGroupAction(formData: FormData) {
  try {
    const { storefront } = await ctx();
    const id = formData.get("id")?.toString();
    if (!id) return { error: "Missing group id." };
    await prisma.storefrontModifierGroup.deleteMany({
      where: { id, storefrontId: storefront.id },
    });
    revalidate(storefront.storeSlug, storefront.id, storefront.userId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function addStorefrontModifierOptionAction(formData: FormData) {
  try {
    const { storefront } = await ctx();
    const parsed = z
      .object({
        groupId: z.string().uuid(),
        name: z.string().min(1).max(120),
        priceAdjustment: z.coerce.number(),
      })
      .safeParse({
        groupId: formData.get("groupId")?.toString(),
        name: formData.get("name")?.toString(),
        priceAdjustment: formData.get("priceAdjustment")?.toString() ?? "0",
      });
    if (!parsed.success) return { error: "Check modifier option fields." };

    const group = await prisma.storefrontModifierGroup.findFirst({
      where: { id: parsed.data.groupId, storefrontId: storefront.id },
    });
    if (!group) return { error: "Modifier group not found." };

    const maxSort = await prisma.storefrontModifierOption.aggregate({
      where: { groupId: group.id },
      _max: { sortOrder: true },
    });

    await prisma.storefrontModifierOption.create({
      data: {
        groupId: group.id,
        name: parsed.data.name.trim(),
        priceAdjustment: parsed.data.priceAdjustment,
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      },
    });

    revalidate(storefront.storeSlug, storefront.id, storefront.userId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function deleteStorefrontModifierOptionAction(formData: FormData) {
  try {
    const { storefront } = await ctx();
    const id = formData.get("id")?.toString();
    if (!id) return { error: "Missing option id." };

    const opt = await prisma.storefrontModifierOption.findFirst({
      where: { id },
      include: { group: { select: { storefrontId: true } } },
    });
    if (!opt || opt.group.storefrontId !== storefront.id) {
      return { error: "Option not found." };
    }

    await prisma.storefrontModifierOption.delete({ where: { id } });
    revalidate(storefront.storeSlug, storefront.id, storefront.userId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function setProductAvailabilityAction(formData: FormData) {
  try {
    const { storefront } = await ctx();
    if (!storefront.activeMenuId) return { error: "Select an active menu first." };

    const parsed = z
      .object({
        productId: z.string().uuid(),
        soldOut: z.coerce.boolean(),
        maxQuantity: z.string().optional(),
      })
      .safeParse({
        productId: formData.get("productId")?.toString(),
        soldOut: formData.get("soldOut") === "on",
        maxQuantity: formData.get("maxQuantity")?.toString(),
      });
    if (!parsed.success) return { error: "Invalid availability payload." };

    await assertProductOnStorefront(storefront.id, parsed.data.productId);

    const now = new Date();
    const until = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    let maxQuantity: number | null = null;
    const mq = parsed.data.maxQuantity?.trim();
    if (mq) {
      const n = parseInt(mq, 10);
      if (!Number.isFinite(n) || n < 0) return { error: "Max quantity is invalid." };
      maxQuantity = n;
    }

    const existing = await prisma.productAvailability.findFirst({
      where: { menuId: storefront.activeMenuId, productId: parsed.data.productId },
    });

    if (existing) {
      await prisma.productAvailability.update({
        where: { id: existing.id },
        data: {
          soldOut: parsed.data.soldOut,
          maxQuantity,
          availableUntil: until,
        },
      });
    } else {
      await prisma.productAvailability.create({
        data: {
          productId: parsed.data.productId,
          menuId: storefront.activeMenuId,
          availableFrom: now,
          availableUntil: until,
          soldOut: parsed.data.soldOut,
          maxQuantity,
          soldQuantity: 0,
        },
      });
    }

    revalidate(storefront.storeSlug, storefront.id, storefront.userId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateCheckoutExtensionsAction(formData: FormData) {
  try {
    await requireTenantActor();
    const { sf: sf } = await requireAdminStorefrontRow("storefront.catalog", { id: true, storeSlug: true, workspaceId: true, userId: true });
    if (!sf) return { error: "Save storefront overview first." };

    const kitchen = await prisma.kitchenSettings.findUnique({ where: { userId: sf.userId } });
    const center =
      kitchen?.settingsCenterJson && typeof kitchen.settingsCenterJson === "object"
        ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
        : {};

    const storefrontBlock =
      center.storefront && typeof center.storefront === "object"
        ? { ...(center.storefront as Record<string, unknown>) }
        : {};

    const ext = checkoutExtensionsSchema.parse({
      tipsEnabled: formData.get("tipsEnabled") === "on",
      tipPresetsPercent: String(formData.get("tipPresets") ?? "10,15,20")
        .split(",")
        .map((x) => Number(x.trim()))
        .filter((n) => Number.isFinite(n)),
      depositMode: formData.get("depositMode")?.toString() ?? "off",
      depositPercent: formData.get("depositPercent")
        ? Number(formData.get("depositPercent"))
        : undefined,
      depositFixed: formData.get("depositFixed") ? Number(formData.get("depositFixed")) : undefined,
    });

    storefrontBlock.checkoutExtensions = ext;
    center.storefront = storefrontBlock;

    await prisma.kitchenSettings.upsert({
      where: { userId: sf.userId },
      create: { userId: sf.userId, settingsCenterJson: toInputJsonValue(center) },
      update: { settingsCenterJson: toInputJsonValue(center) },
    });

    const feeBpsRaw = formData.get("stripeApplicationFeeBps")?.toString()?.trim();
    if (feeBpsRaw) {
      const bps = parseInt(feeBpsRaw, 10);
      if (Number.isFinite(bps) && bps >= 0 && bps <= 5000) {
        await prisma.storefrontSettings.update({
          where: { id: sf.id },
          data: { stripeApplicationFeeBps: bps },
        });
      }
    }

    revalidate(sf.storeSlug, sf.id, sf.userId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
