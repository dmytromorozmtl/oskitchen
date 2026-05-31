import type { InventoryConflictResolution } from "@/lib/integrations/inventory-sync-settings";

export type InventoryLevelRow = {
  connectionId: string;
  provider: "SHOPIFY" | "WOOCOMMERCE";
  externalProductId: string;
  externalVariantId: string;
  mappedProductId: string | null;
  productTitle: string;
  sku: string | null;
  kitchenQuantity: number;
  channelQuantity: number;
  inventoryItemId?: string | null;
};

export type InventorySyncConflict = {
  id: string;
  level: InventoryLevelRow;
  delta: number;
};

export type InventorySyncSnapshot = {
  pulledAtIso: string;
  levels: InventoryLevelRow[];
  conflicts: InventorySyncConflict[];
  inSyncCount: number;
  notes: string[];
};

export type SyncApplyResult = {
  pushed: number;
  pulled: number;
  resolved: number;
  remainingConflicts: InventorySyncConflict[];
};

function roundQty(value: number): number {
  return Math.max(0, Math.round(value));
}

export function extractShopifyChannelQuantity(rawPayloadJson: unknown): number {
  if (!rawPayloadJson || typeof rawPayloadJson !== "object") return 0;
  const o = rawPayloadJson as Record<string, unknown>;
  const variant = o.variant as Record<string, unknown> | undefined;
  if (variant?.inventoryQuantity != null) return roundQty(Number(variant.inventoryQuantity));
  if (o.inventoryQuantity != null) return roundQty(Number(o.inventoryQuantity));
  return 0;
}

export function extractWooChannelQuantity(rawPayloadJson: unknown): number {
  if (!rawPayloadJson || typeof rawPayloadJson !== "object") return 0;
  const o = rawPayloadJson as Record<string, unknown>;
  if (o.stock_quantity != null) return roundQty(Number(o.stock_quantity));
  return 0;
}

export function extractChannelQuantity(provider: string, rawPayloadJson: unknown): number {
  if (provider === "SHOPIFY") return extractShopifyChannelQuantity(rawPayloadJson);
  if (provider === "WOOCOMMERCE") return extractWooChannelQuantity(rawPayloadJson);
  return 0;
}

export function detectInventoryConflicts(levels: InventoryLevelRow[]): InventorySyncConflict[] {
  const conflicts: InventorySyncConflict[] = [];
  for (const level of levels) {
    if (!level.mappedProductId) continue;
    const delta = level.kitchenQuantity - level.channelQuantity;
    if (delta === 0) continue;
    conflicts.push({
      id: `${level.connectionId}:${level.externalProductId}:${level.externalVariantId}`,
      level,
      delta,
    });
  }
  return conflicts;
}

export function buildInventorySyncSnapshot(params: {
  levels: InventoryLevelRow[];
  now?: Date;
}): InventorySyncSnapshot {
  const conflicts = detectInventoryConflicts(params.levels);
  const inSyncCount = params.levels.filter(
    (l) => l.mappedProductId && l.kitchenQuantity === l.channelQuantity,
  ).length;

  return {
    pulledAtIso: (params.now ?? new Date()).toISOString(),
    levels: params.levels,
    conflicts,
    inSyncCount,
    notes: [
      "Bidirectional sync compares mapped products to Shopify/Woo stock levels.",
      "Unresolved conflicts stay in the queue until you pick Kitchen wins or Channel wins.",
    ],
  };
}

export function resolveConflictQuantity(
  conflict: InventorySyncConflict,
  strategy: InventoryConflictResolution,
): { kitchenQuantity: number; channelQuantity: number; resolved: boolean } {
  if (strategy === "manual_review") {
    return {
      kitchenQuantity: conflict.level.kitchenQuantity,
      channelQuantity: conflict.level.channelQuantity,
      resolved: false,
    };
  }
  if (strategy === "kitchen_wins") {
    return {
      kitchenQuantity: conflict.level.kitchenQuantity,
      channelQuantity: conflict.level.kitchenQuantity,
      resolved: true,
    };
  }
  return {
    kitchenQuantity: conflict.level.channelQuantity,
    channelQuantity: conflict.level.channelQuantity,
    resolved: true,
  };
}

export function applyInventorySyncPlan(params: {
  conflicts: InventorySyncConflict[];
  strategy: InventoryConflictResolution;
}): SyncApplyResult {
  let resolved = 0;
  const remaining: InventorySyncConflict[] = [];

  for (const conflict of params.conflicts) {
    const outcome = resolveConflictQuantity(conflict, params.strategy);
    if (outcome.resolved) resolved += 1;
    else remaining.push(conflict);
  }

  return {
    pushed: params.strategy === "kitchen_wins" ? resolved : 0,
    pulled: params.strategy === "channel_wins" ? resolved : 0,
    resolved,
    remainingConflicts: remaining,
  };
}
