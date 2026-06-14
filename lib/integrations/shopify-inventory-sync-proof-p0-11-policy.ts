/**
 * P0-11 — Shopify bi-directional inventory sync proof.
 *
 * @see docs/shopify-inventory-sync-proof-p0-11.md
 */

export const SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_POLICY_ID =
  "p0-11-shopify-inventory-sync-proof-v1" as const;

export const SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_DOC =
  "docs/shopify-inventory-sync-proof-p0-11.md" as const;

export const SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_ARTIFACT =
  "artifacts/shopify-inventory-sync-proof.json" as const;

export const SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_E2E_SPEC =
  "e2e/shopify-inventory-sync-proof.spec.ts" as const;

export const SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_SMOKE_SKU = "GOLDEN-SHOPIFY-1" as const;

export const SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_EXTERNAL_PRODUCT_ID = "smoke-inv-5001" as const;

export const SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_EXTERNAL_VARIANT_ID = "smoke-var-90001" as const;

export const SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_REQUIRED_STEP_IDS = [
  "merchant_proof_fixture",
  "inventory_sync_outbound_kitchen",
  "inventory_sync_inbound_product_webhook",
  "inventory_sync_bidirectional_complete",
] as const;

export const SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_WIRING_PATHS = [
  SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_DOC,
  "services/integrations/shopify/inventory-sync.service.ts",
  "lib/webhooks/shopify-webhook-processor.ts",
  "services/integrations/shopify-inventory-sync-proof-p0-11.ts",
  "scripts/smoke-shopify-live.ts",
  SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_E2E_SPEC,
] as const;
