export type MarketplaceInventoryLink = {
  ingredientId: string;
  inventorySku?: string | null;
  unitsPerPack: number;
  linkedAt: string;
  linkedByUserId?: string | null;
};

export type MarketplaceInventoryTransactionType = "PURCHASE" | "ADJUSTMENT";

export type MarketplaceInventoryTransaction = {
  id: string;
  type: MarketplaceInventoryTransactionType;
  workspaceId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  purchaseOrderId?: string | null;
  productId?: string | null;
  sku?: string | null;
  createdAt: string;
};

function parseAttributesRoot(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw == null || Array.isArray(raw)) return {};
  return raw as Record<string, unknown>;
}

export function parseProductInventoryLink(raw: unknown): MarketplaceInventoryLink | null {
  const root = parseAttributesRoot(raw);
  const link = parseAttributesRoot(root.inventoryLink);
  if (typeof link.ingredientId !== "string" || !link.ingredientId) return null;
  const unitsPerPack = Number(link.unitsPerPack);
  return {
    ingredientId: link.ingredientId,
    inventorySku: typeof link.inventorySku === "string" ? link.inventorySku : null,
    unitsPerPack: Number.isFinite(unitsPerPack) && unitsPerPack > 0 ? unitsPerPack : 1,
    linkedAt: typeof link.linkedAt === "string" ? link.linkedAt : new Date().toISOString(),
    linkedByUserId: typeof link.linkedByUserId === "string" ? link.linkedByUserId : null,
  };
}

export function mergeProductInventoryLink(
  attributes: unknown,
  link: MarketplaceInventoryLink,
): Record<string, unknown> {
  const root = parseAttributesRoot(attributes);
  return {
    ...root,
    inventoryLink: link,
  };
}
