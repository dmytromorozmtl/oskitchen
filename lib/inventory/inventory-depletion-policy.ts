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

/**
 * Era 5 Cycle 3 — permanent GTM lock: defer storefront/API depletion until an explicit
 * future era implements payment-timing + idempotency + cert gates. Sales must not imply
 * unified cross-channel stock impact.
 */
export const INVENTORY_DEPLETION_GTM_LOCK_ID = "era5-pos-only-gtm-lock-v1" as const;

export const INVENTORY_DEPLETION_STOREFRONT_HOOK_STATUS = "deferred_locked" as const;

/** Order entrypoints that must not call POS inventory impact recording. */
export const INVENTORY_DEPLETION_NON_DEPLETING_ENTRYPOINTS = [
  "actions/storefront-order.ts",
  "actions/order-creation.ts",
  "app/api/public/v1/orders/route.ts",
] as const;

/**
 * Phrases that must not appear in canonical GTM docs (product-positioning, feature matrix,
 * competitor gap matrix) without explicit negation — enforced by CI cert.
 */
export const INVENTORY_DEPLETION_FORBIDDEN_GTM_PHRASES = [
  "unified cross-channel depletion",
  "storefront checkout depletes",
  "storefront depletes stock",
  "online orders automatically reduce on-hand",
  "all channels deplete",
  "every channel depletes",
] as const;

export const INVENTORY_DEPLETION_GTM_REQUIRED_MARKERS = [
  INVENTORY_DEPLETION_POLICY_ID,
  INVENTORY_DEPLETION_GTM_LOCK_ID,
  "POS-only",
] as const;
