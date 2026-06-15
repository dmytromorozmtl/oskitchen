"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { adminStorefrontCookieOptions } from "@/lib/storefront/storefront-admin-cookie";
import {
  requireStorefrontAdminPermission,
  resolveStorefrontAdminAccess,
} from "@/lib/storefront/storefront-admin-access";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import { resolveOwnerStorefront, listOwnerStorefronts } from "@/lib/storefront/resolve-owner-storefront";
import { safeError } from "@/lib/security";

const createSchema = z.object({
  storeSlug: z.string().min(2).max(80),
  publicName: z.string().min(1).max(255),
  brandId: z.string().uuid().optional().or(z.literal("")),
});

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Switch active admin storefront (cookie). */
export async function setActiveAdminStorefrontAction(formData: FormData) {
  try {
    const { sessionUser } = await requireTenantActor();
    const storefrontId = formData.get("storefrontId")?.toString()?.trim();
    if (!storefrontId) return { error: "Missing storefront." };

    const access = await resolveStorefrontAdminAccess(sessionUser.id);
    if (!access.ok) return { error: access.error };

    if (access.isOwner) {
      const sf = await prisma.storefrontSettings.findFirst({
        where: { id: storefrontId, userId: sessionUser.id },
        select: { id: true },
      });
      if (!sf) return { error: "Storefront not found." };
    } else if (storefrontId !== access.storefront.id) {
      return { error: "You cannot switch to that storefront." };
    }

    const jar = await cookies();
    jar.set(adminStorefrontCookieOptions(storefrontId));

    revalidatePath("/dashboard/storefront", "layout");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

/** Create an additional storefront for the same owner (multi-store). */
export async function createAdditionalStorefrontAction(formData: FormData) {
  try {
    const access = await requireStorefrontAdminPermission("storefront.settings");
    if (!access.isOwner) {
      return { error: "Only the storefront owner can create additional stores." };
    }
    const { sessionUser: user, userId } = await requireTenantActor();
    const parsed = createSchema.safeParse({
      storeSlug: formData.get("storeSlug")?.toString(),
      publicName: formData.get("publicName")?.toString(),
      brandId: formData.get("brandId")?.toString() || "",
    });
    if (!parsed.success) return { error: "Check store name and URL slug." };

    const slug = slugify(parsed.data.storeSlug);
    if (!slug) return { error: "Invalid store URL slug." };

    const clash = await prisma.storefrontSettings.findFirst({
      where: { storeSlug: slug },
    });
    if (clash) return { error: "That store URL is already taken." };

    const primary = await resolveOwnerStorefront(user.id);
    const workspaceId = primary?.workspaceId ?? null;
    const brandIdRaw = parsed.data.brandId?.trim();
    const brandId = brandIdRaw && /^[0-9a-f-]{36}$/i.test(brandIdRaw) ? brandIdRaw : null;

    if (brandId && workspaceId) {
      const brand = await prisma.brand.findFirst({
        where: { id: brandId, workspaceId },
      });
      if (!brand) return { error: "Brand not found in workspace." };
    }

    const created = await prisma.$transaction(async (tx) => {
      const count = await tx.storefrontSettings.count({ where: { userId } });
      const isFirst = count === 0;

      return tx.storefrontSettings.create({
        data: {
          userId,
          storeSlug: slug,
          publicName: parsed.data.publicName.trim(),
          workspaceId,
          brandId,
          isPrimary: isFirst,
          enabled: false,
          published: false,
        },
        select: { id: true, storeSlug: true },
      });
    });

    const jar = await cookies();
    jar.set(adminStorefrontCookieOptions(created.id));

    revalidateStorefrontDashboardAndPublic(created.storeSlug, "settings", {
      storefrontId: created.id,
      ownerUserId: user.id,
    });
    revalidatePath("/dashboard/storefront/workspace");
    return { ok: true as const, storefrontId: created.id, storeSlug: created.storeSlug };
  } catch (e) {
    return { error: safeError(e) };
  }
}

/** Mark a storefront as primary (one per owner). */
export async function setPrimaryStorefrontAction(formData: FormData) {
  try {
    const access = await requireStorefrontAdminPermission("storefront.settings");
    if (!access.isOwner) {
      return { error: "Only the storefront owner can change the primary store." };
    }
    const { userId } = await requireTenantActor();
    const storefrontId = formData.get("storefrontId")?.toString()?.trim();
    if (!storefrontId) return { error: "Missing storefront." };

    const target = await prisma.storefrontSettings.findFirst({
      where: { id: storefrontId, userId },
    });
    if (!target) return { error: "Storefront not found." };

    await prisma.$transaction([
      prisma.storefrontSettings.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      }),
      prisma.storefrontSettings.update({
        where: { id: target.id },
        data: { isPrimary: true },
      }),
    ]);

    revalidatePath("/dashboard/storefront/workspace");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function listOwnerStorefrontsForDashboard(userId: string) {
  return listOwnerStorefronts(userId);
}
