import { prisma } from "@/lib/prisma";
import type {
  StorefrontCatalogModifierGroup,
  StorefrontCatalogVariant,
} from "@/lib/storefront/catalog-types";

export async function loadVariantAndModifierMaps(input: {
  storefrontId: string;
  productIds: string[];
}): Promise<{
  variantsByProduct: Map<string, StorefrontCatalogVariant[]>;
  modifiersByProduct: Map<string, StorefrontCatalogModifierGroup[]>;
}> {
  const variantsByProduct = new Map<string, StorefrontCatalogVariant[]>();
  const modifiersByProduct = new Map<string, StorefrontCatalogModifierGroup[]>();

  if (input.productIds.length === 0) {
    return { variantsByProduct, modifiersByProduct };
  }

  const [variants, groups] = await Promise.all([
    prisma.storefrontProductVariant.findMany({
      where: {
        storefrontId: input.storefrontId,
        productId: { in: input.productIds },
        active: true,
      },
      orderBy: [{ productId: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.storefrontModifierGroup.findMany({
      where: {
        storefrontId: input.storefrontId,
        active: true,
        OR: [{ productId: null }, { productId: { in: input.productIds } }],
      },
      include: {
        options: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  for (const v of variants) {
    const list = variantsByProduct.get(v.productId) ?? [];
    list.push({
      id: v.id,
      title: v.title,
      sku: v.sku,
      price: 0,
      soldOut: v.soldOut,
      canAddToCart: !v.soldOut,
    });
    variantsByProduct.set(v.productId, list);
  }

  for (const g of groups) {
    const mapped: StorefrontCatalogModifierGroup = {
      id: g.id,
      name: g.name,
      required: g.required,
      minSelections: g.minSelections,
      maxSelections: g.maxSelections,
      options: g.options.map((o) => ({
        id: o.id,
        name: o.name,
        priceAdjustment: Number(o.priceAdjustment),
      })),
    };
    if (g.productId) {
      const list = modifiersByProduct.get(g.productId) ?? [];
      list.push(mapped);
      modifiersByProduct.set(g.productId, list);
    } else {
      for (const pid of input.productIds) {
        const list = modifiersByProduct.get(pid) ?? [];
        if (!list.some((x) => x.id === mapped.id)) list.push(mapped);
        modifiersByProduct.set(pid, list);
      }
    }
  }

  return { variantsByProduct, modifiersByProduct };
}

export function resolveVariantUnitPrice(
  basePrice: number,
  variantRow: {
    priceOverride: { toString(): string } | null;
    priceAdjustment: { toString(): string };
  },
): number {
  if (variantRow.priceOverride != null) {
    return Number(variantRow.priceOverride);
  }
  return Math.round((basePrice + Number(variantRow.priceAdjustment)) * 100) / 100;
}
