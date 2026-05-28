/**
 * Canonical inventory recipe-depletion channel policy.
 *
 * Evolution Era 4 Cycle 1 decision: certify POS checkout only. Other order
 * channels share the unified order spine but do not call inventory impact
 * recording until a scoped cross-channel hook exists (payment timing,
 * idempotency, cancellation/refund policy).
 */

export const INVENTORY_DEPLETION_POLICY_ID = "era4-pos-only-v1" as const;

export type InventoryDepletionChannel =
  | "pos"
  | "storefront"
  | "public_api"
  | "manual"
  | "integration";

/** Channels where `recordPendingInventoryImpactsForPosOrder` is invoked on sale. */
export const INVENTORY_DEPLETION_CERTIFIED_CHANNELS = ["pos"] as const satisfies readonly InventoryDepletionChannel[];

/** Channels that create orders but do not trigger recipe depletion today. */
export const INVENTORY_DEPLETION_NON_CERTIFIED_CHANNELS = [
  "storefront",
  "public_api",
  "manual",
  "integration",
] as const satisfies readonly InventoryDepletionChannel[];

export function isInventoryDepletionCertifiedForChannel(
  channel: InventoryDepletionChannel,
): boolean {
  return (INVENTORY_DEPLETION_CERTIFIED_CHANNELS as readonly string[]).includes(channel);
}

/** Safe for sales/GTM when describing cross-channel stock impact. */
export const INVENTORY_DEPLETION_UNIFIED_STOCK_CLAIM_ALLOWED = false;

export const INVENTORY_DEPLETION_POLICY_SUMMARY =
  "Recipe ingredient depletion on sale is certified for POS checkout only. Storefront, public API, manual, and marketplace-import orders do not deplete on-hand inventory until a dedicated hook is implemented, idempotency-tested, and documented in the maturity matrix.";
