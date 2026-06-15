"use server";


import { fail, ok } from "@/lib/action-result";
import { z } from "zod";

import { productByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { assertStorefrontManageAccess } from "@/lib/storefront/require-storefront-actor";
import { resolveOwnerStorefront } from "@/lib/storefront/resolve-owner-storefront";
import { readAdminStorefrontCookie } from "@/lib/storefront/storefront-admin-cookie";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";

function slugifyProduct(input: string): string | null {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return s.length > 0 ? s : null;
}

const updateSchema = z.object({
  productId: z.string().uuid(),
  publicSlug: z.string().max(160).optional().or(z.literal("")),
  storefrontVisible: z.coerce.boolean(),
  storefrontFeatured: z.coerce.boolean(),
  maxStorefrontQuantity: z.string().max(12).optional().or(z.literal("")),
  storefrontSeoTitle: z.string().max(255).optional().or(z.literal("")),
  storefrontSeoDescription: z.string().max(2000).optional().or(z.literal("")),
  storefrontOgImageUrl: z.string().max(2000).optional().or(z.literal("")),
});

export async function updateStorefrontProductFields(formData: FormData) {
  try {
    const manageDenied = await assertStorefrontManageAccess("storefront.products.update");
    if (manageDenied) return manageDenied;

    const { userId } = await requireTenantActor();
    const preferredId = await readAdminStorefrontCookie();
    const sf = await resolveOwnerStorefront(userId, preferredId);
    if (!sf) return { error: "Save the storefront overview once first." };
    const parsed = updateSchema.safeParse({
      productId: formData.get("productId")?.toString(),
      publicSlug: formData.get("publicSlug")?.toString(),
      storefrontVisible: formData.get("storefrontVisible") === "on",
      storefrontFeatured: formData.get("storefrontFeatured") === "on",
      maxStorefrontQuantity: formData.get("maxStorefrontQuantity")?.toString(),
      storefrontSeoTitle: formData.get("storefrontSeoTitle")?.toString(),
      storefrontSeoDescription: formData.get("storefrontSeoDescription")?.toString(),
      storefrontOgImageUrl: formData.get("storefrontOgImageUrl")?.toString(),
    });
    if (!parsed.success) return { error: "Invalid product fields." };
    const d = parsed.data;

    const maxRaw = (d.maxStorefrontQuantity ?? "").trim();
    let maxStorefrontQuantity: number | null = null;
    if (maxRaw.length > 0) {
      const n = Number(maxRaw);
      if (!Number.isFinite(n) || n < 1 || n > 500) return { error: "Max quantity must be between 1 and 500." };
      maxStorefrontQuantity = Math.floor(n);
    }

    const slugRaw = (d.publicSlug ?? "").trim();
    const publicSlug = slugRaw ? slugifyProduct(slugRaw) : null;
    if (slugRaw && !publicSlug) return { error: "Public URL slug is invalid." };

    const product = await prisma.product.findFirst({
      where: await productByIdWhereForOwner(userId, d.productId),
      include: { menu: { select: { id: true } } },
    });
    if (!product) return { error: "Product not found." };
    if (sf.activeMenuId && product.menuId !== sf.activeMenuId) {
      return { error: "Product is not on the active storefront menu." };
    }

    if (publicSlug) {
      const clash = await prisma.product.findFirst({
        where: {
          menuId: product.menuId,
          publicSlug,
          NOT: { id: product.id },
        },
      });
      if (clash) return { error: "Another product on this menu already uses that URL slug." };
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        publicSlug,
        storefrontVisible: d.storefrontVisible,
        storefrontFeatured: d.storefrontFeatured,
        maxStorefrontQuantity,
        storefrontSeoTitle: d.storefrontSeoTitle?.trim() || null,
        storefrontSeoDescription: d.storefrontSeoDescription?.trim() || null,
        storefrontOgImageUrl: d.storefrontOgImageUrl?.trim() || null,
      },
    });

    revalidateStorefrontDashboardAndPublic(sf.storeSlug);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontProductFieldsFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontProductFields(formData));
}
