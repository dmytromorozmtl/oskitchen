/**
 * P0-10 — WooCommerce merchant proof: KDS chain + bi-directional inventory sync.
 *
 * @see docs/woocommerce-merchant-proof-p0-10.md
 */

export const WOOCOMMERCE_MERCHANT_PROOF_P0_10_POLICY_ID =
  "p0-10-woocommerce-merchant-proof-v1" as const;

export const WOOCOMMERCE_MERCHANT_PROOF_P0_10_DOC =
  "docs/woocommerce-merchant-proof-p0-10.md" as const;

export const WOOCOMMERCE_MERCHANT_PROOF_P0_10_ARTIFACT =
  "artifacts/woocommerce-merchant-proof-inventory-sync.json" as const;

export const WOOCOMMERCE_MERCHANT_PROOF_P0_10_SMOKE_SKU = "GOLDEN-WOO-1" as const;

export const WOOCOMMERCE_MERCHANT_PROOF_P0_10_EXTERNAL_PRODUCT_ID = "smoke-inv-9001" as const;

export const WOOCOMMERCE_MERCHANT_PROOF_P0_10_REQUIRED_STEP_IDS = [
  "merchant_proof_fixture",
  "inventory_sync_outbound_kitchen",
  "inventory_sync_inbound_product_webhook",
  "inventory_sync_bidirectional_complete",
] as const;

export const WOOCOMMERCE_MERCHANT_PROOF_P0_10_WIRING_PATHS = [
  WOOCOMMERCE_MERCHANT_PROOF_P0_10_DOC,
  "services/integrations/woocommerce/inventory-sync.service.ts",
  "lib/webhooks/woocommerce-webhook-processor.ts",
  "services/integrations/woocommerce-merchant-proof-p0-10.ts",
  "scripts/smoke-woocommerce-live.ts",
  WOOCOMMERCE_MERCHANT_PROOF_P0_10_ARTIFACT,
] as const;
