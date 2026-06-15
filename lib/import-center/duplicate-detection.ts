import type { ImportType } from "@prisma/client";

/**
 * Produces a normalised, type-specific dedupe key from a validated row.
 * Returns null when no key can be derived (which means the row should never
 * be considered a duplicate against another).
 */
export function dedupeKey(
  type: ImportType,
  normalized: Record<string, unknown> | null,
): string | null {
  if (!normalized) return null;
  switch (type) {
    case "PRODUCTS": {
      const sku = (normalized.sku as string | null)?.toLowerCase();
      if (sku) return `sku:${sku}`;
      const title = (normalized.title as string | null)?.toLowerCase().trim();
      return title ? `title:${title}` : null;
    }
    case "CUSTOMERS": {
      const email = (normalized.email as string | null)?.toLowerCase();
      if (email) return `email:${email}`;
      const phone = (normalized.phone as string | null)?.replace(/[^\d+]/g, "");
      return phone ? `phone:${phone}` : null;
    }
    case "ORDERS": {
      const orderNumber = (normalized.orderNumber as string | null)?.toLowerCase();
      return orderNumber ? `order:${orderNumber}` : null;
    }
    case "INGREDIENTS": {
      const name = (normalized.name as string | null)?.toLowerCase().trim();
      const unit = (normalized.unit as string | null)?.toLowerCase().trim();
      return name && unit ? `ingredient:${name}|${unit}` : null;
    }
    case "RECIPES": {
      const recipe = (normalized.recipeName as string | null)?.toLowerCase().trim();
      return recipe ? `recipe:${recipe}` : null;
    }
    case "STAFF": {
      const email = (normalized.email as string | null)?.toLowerCase();
      if (email) return `staff_email:${email}`;
      const name = (normalized.name as string | null)?.toLowerCase().trim();
      return name ? `staff_name:${name}` : null;
    }
    case "SUPPLIERS": {
      const email = (normalized.email as string | null)?.toLowerCase();
      if (email) return `supplier_email:${email}`;
      const name = (normalized.name as string | null)?.toLowerCase().trim();
      return name ? `supplier_name:${name}` : null;
    }
    case "BRANDS":
    case "LOCATIONS": {
      const slug = (normalized.slug as string | null)?.toLowerCase().trim();
      if (slug) return `${type.toLowerCase()}_slug:${slug}`;
      const name = (normalized.name as string | null)?.toLowerCase().trim();
      return name ? `${type.toLowerCase()}_name:${name}` : null;
    }
    case "NUTRITION_ALLERGENS": {
      const productId = (normalized.productId as string | null)?.toLowerCase();
      return productId ? `nutrition:${productId}` : null;
    }
    case "PRODUCT_MAPPINGS": {
      const provider = (normalized.provider as string | null)?.toLowerCase();
      const externalId = (normalized.externalProductId as string | null)?.toLowerCase();
      return provider && externalId ? `mapping:${provider}|${externalId}` : null;
    }
    case "MENU_ASSIGNMENTS": {
      const productId = (normalized.productId as string | null)?.toLowerCase();
      const menuId = (normalized.menuId as string | null)?.toLowerCase();
      return productId && menuId ? `assignment:${productId}|${menuId}` : null;
    }
    case "PURCHASE_ITEMS": {
      const ingredientId = (normalized.ingredientId as string | null)?.toLowerCase();
      const supplierId = (normalized.supplierId as string | null)?.toLowerCase();
      return ingredientId && supplierId ? `pi:${ingredientId}|${supplierId}` : null;
    }
    default:
      return null;
  }
}

export type ExistingMatchLookup = {
  /** Existing matches keyed by dedupe key → existing entity id. */
  matches: Map<string, string>;
};

export function emptyExistingMatchLookup(): ExistingMatchLookup {
  return { matches: new Map() };
}
