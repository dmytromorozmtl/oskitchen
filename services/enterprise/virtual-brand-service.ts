import type { BrandConceptKind, Prisma } from "@prisma/client";
import { addDays, startOfWeek } from "date-fns";

import { getBrandTemplateDefaults, type BrandTemplateKey } from "@/lib/brands/brand-template-defaults";
import { slugifyBrandSlug, brandSetupProgress } from "@/lib/brands/brand-helpers";
import {
  buildVirtualBrandManagerDashboard,
  buildVirtualBrandProvisionResult,
} from "@/lib/enterprise/virtual-brand-builders";
import type { VirtualBrandTemplateKey } from "@/lib/enterprise/virtual-brand-policy";
import type {
  VirtualBrandCloneSource,
  VirtualBrandManagerDashboard,
  VirtualBrandProvisionResult,
  VirtualBrandRow,
} from "@/lib/enterprise/virtual-brand-types";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";

export type {
  VirtualBrandManagerDashboard,
  VirtualBrandProvisionResult,
  VirtualBrandTemplateCard,
} from "@/lib/enterprise/virtual-brand-types";

const VIRTUAL_CONCEPT_KINDS: BrandConceptKind[] = [
  "GHOST_KITCHEN_BRAND",
  "CLOUD_KITCHEN_BRAND",
  "MEAL_PREP_BRAND",
  "CATERING_BRAND",
];

async function uniqueBrandSlug(workspaceId: string, base: string): Promise<string> {
  let candidate = base.slice(0, 120);
  let suffix = 2;
  while (
    await prisma.brand.findFirst({
      where: { workspaceId, slug: candidate },
      select: { id: true },
    })
  ) {
    candidate = `${base.slice(0, 110)}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

async function uniqueStoreSlug(base: string): Promise<string> {
  let candidate = base.slice(0, 60);
  let suffix = 2;
  while (
    await prisma.storefrontSettings.findFirst({
      where: { storeSlug: candidate },
      select: { id: true },
    })
  ) {
    candidate = `${base.slice(0, 50)}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

async function loadVirtualBrandRows(workspaceId: string): Promise<VirtualBrandRow[]> {
  const brands = await prisma.brand.findMany({
    where: {
      workspaceId,
      conceptKind: { in: VIRTUAL_CONCEPT_KINDS },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      name: true,
      slug: true,
      conceptKind: true,
      logoUrl: true,
      brandColor: true,
      description: true,
      createdAt: true,
      _count: {
        select: {
          menus: true,
          storefrontSettings: true,
        },
      },
    },
  });

  return brands.map((brand) => ({
    brandId: brand.id,
    name: brand.name,
    slug: brand.slug,
    conceptKind: brand.conceptKind,
    menuCount: brand._count.menus,
    storefrontCount: brand._count.storefrontSettings,
    setupProgress: brandSetupProgress({
      hasDescription: Boolean(brand.description?.trim()),
      hasLogo: Boolean(brand.logoUrl?.trim()),
      hasColor: Boolean(brand.brandColor?.trim()),
      menuCount: brand._count.menus,
      storefrontCount: brand._count.storefrontSettings,
    }),
    createdAtIso: brand.createdAt.toISOString(),
  }));
}

async function loadCloneSources(ownerUserId: string): Promise<VirtualBrandCloneSource[]> {
  const menus = await prisma.menu.findMany({
    where: {
      userId: ownerUserId,
      catalogOnly: false,
      active: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
    select: {
      id: true,
      title: true,
      _count: { select: { products: { where: { active: true } } } },
    },
  });

  return menus
    .filter((row) => row._count.products > 0)
    .map((row) => ({
      menuId: row.id,
      title: row.title,
      productCount: row._count.products,
    }));
}

export async function loadVirtualBrandManagerDashboard(workspaceId: string): Promise<VirtualBrandManagerDashboard> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const [virtualBrands, cloneSources] = await Promise.all([
    loadVirtualBrandRows(workspaceId),
    loadCloneSources(ownerUserId),
  ]);

  return buildVirtualBrandManagerDashboard({
    workspaceId,
    virtualBrands,
    cloneSources,
  });
}

export async function loadVirtualBrandManagerDashboardForUser(userId: string) {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) {
    throw new Error(`No workspace for user: ${userId}`);
  }
  return loadVirtualBrandManagerDashboard(workspaceId);
}

export type ProvisionVirtualBrandInput = {
  workspaceId: string;
  ownerUserId: string;
  name: string;
  slug?: string;
  templateKey: VirtualBrandTemplateKey;
  cloneFromMenuId?: string;
  brandColor?: string;
};

/**
 * Provision a virtual brand in one transaction — brand, starter menu, storefront link.
 * Designed for a ~5 minute operator flow from template to launch checklist.
 */
export async function provisionVirtualBrand(
  input: ProvisionVirtualBrandInput,
): Promise<VirtualBrandProvisionResult> {
  const template = getBrandTemplateDefaults(input.templateKey as BrandTemplateKey);
  const baseSlug = slugifyBrandSlug(input.slug?.trim() || input.name);
  const slug = await uniqueBrandSlug(input.workspaceId, baseSlug || "virtual-brand");

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const preorderDeadline = addDays(weekStart, -1);

  const fulfillment: Record<string, unknown> = {
    storefrontTemplate: template.storefrontTemplate,
    menuStrategy: template.menuStrategy,
    provisionedBy: "virtual-brand-manager",
  };

  return prisma.$transaction(async (tx) => {
    const brand = await tx.brand.create({
      data: {
        workspaceId: input.workspaceId,
        name: input.name.trim(),
        slug,
        description: template.descriptionHint,
        conceptKind: template.conceptKind,
        lifecycleStatus: "ACTIVE",
        defaultBusinessMode: template.defaultBusinessMode,
        brandColor: input.brandColor?.trim() || "#7c3aed",
        secondaryColor: "#a78bfa",
        seoTitle: input.name.trim(),
        seoDescription: template.descriptionHint,
        fulfillmentSettingsJson: fulfillment as Prisma.InputJsonValue,
      },
    });

    const menu = await tx.menu.create({
      data: {
        userId: input.ownerUserId,
        workspaceId: input.workspaceId,
        brandId: brand.id,
        title: `${input.name.trim()} — Starter menu`,
        description: template.descriptionHint,
        strategy: template.menuStrategy,
        startDate: weekStart,
        endDate: weekEnd,
        preorderDeadline,
        active: true,
        published: false,
        sortOrder: 0,
        storefrontSettingsJson: {
          template: template.storefrontTemplate,
        } as Prisma.InputJsonValue,
      },
    });

    if (input.cloneFromMenuId) {
      const source = await tx.menu.findFirst({
        where: {
          id: input.cloneFromMenuId,
          userId: input.ownerUserId,
          catalogOnly: false,
        },
        include: {
          products: {
            where: { active: true },
            orderBy: { sortOrder: "asc" },
            take: 24,
          },
        },
      });

      if (source?.products.length) {
        for (const product of source.products) {
          await tx.product.create({
            data: {
              menuId: menu.id,
              workspaceId: input.workspaceId,
              brandId: brand.id,
              title: product.title,
              description: product.description,
              category: product.category,
              allergens: product.allergens,
              ingredients: product.ingredients,
              portionSize: product.portionSize,
              preparedDate: product.preparedDate,
              active: true,
              price: product.price,
              image: product.image,
              sortOrder: product.sortOrder,
            },
          });
        }
      }
    }

    const primaryStorefront = await tx.storefrontSettings.findFirst({
      where: { userId: input.ownerUserId, isPrimary: true },
      select: { id: true, published: true, brandId: true },
    });

    let storefrontId: string | null = null;
    let storefrontPublished = false;
    let storefrontCount = 0;

    if (primaryStorefront) {
      storefrontId = primaryStorefront.id;
      storefrontPublished = primaryStorefront.published;
      storefrontCount = 1;
      await tx.storefrontSettings.update({
        where: { id: primaryStorefront.id },
        data: {
          brandId: brand.id,
          workspaceId: input.workspaceId,
          activeMenuId: menu.id,
        },
      });
    } else {
      const storeSlug = await uniqueStoreSlug(slug);
      const created = await tx.storefrontSettings.create({
        data: {
          userId: input.ownerUserId,
          workspaceId: input.workspaceId,
          brandId: brand.id,
          storeSlug,
          publicName: input.name.trim(),
          enabled: false,
          published: false,
          isPrimary: true,
          activeMenuId: menu.id,
          brandColor: input.brandColor?.trim() || "#7c3aed",
          secondaryColor: "#a78bfa",
        },
        select: { id: true, published: true },
      });
      storefrontId = created.id;
      storefrontPublished = created.published;
      storefrontCount = 1;
    }

    await tx.brand.update({
      where: { id: brand.id },
      data: {
        defaultMenuId: menu.id,
        defaultStorefrontId: storefrontId,
      },
    });

    const productCount = await tx.product.count({
      where: { menuId: menu.id, active: true },
    });

    return buildVirtualBrandProvisionResult({
      brandId: brand.id,
      menuId: menu.id,
      storefrontId,
      slug,
      templateKey: input.templateKey,
      hasLogo: false,
      hasColor: Boolean(input.brandColor?.trim()),
      menuCount: 1,
      menuItemCount: productCount,
      storefrontCount,
      storefrontPublished,
    });
  });
}
