/**
 * P1-32 — Shopify real-time inventory sync proof (inventory_levels/update).
 *
 * @see docs/shopify-realtime-inventory-sync-proof-p1-32.md
 */

export const SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_POLICY_ID =
  "shopify-realtime-inventory-sync-proof-p1-32-v1" as const;

export const SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_DOC =
  "docs/shopify-realtime-inventory-sync-proof-p1-32.md" as const;

export const SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_ARTIFACT =
  "artifacts/shopify-realtime-inventory-sync-proof-p1-32.json" as const;

export const SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_E2E_SPEC =
  "e2e/shopify-realtime-inventory-sync-proof.spec.ts" as const;

export const SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_SERVICE =
  "services/integrations/shopify-realtime-inventory-sync-proof-p1-32.ts" as const;

export const SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_WEBHOOK_TOPIC =
  "inventory_levels/update" as const;

/** Real-time budget — webhook ingest → kitchen qty update (synthetic smoke). */
export const SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_LATENCY_BUDGET_MS = 5000 as const;

export const SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_INVENTORY_ITEM_ID = "99001" as const;

export const SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_REQUIRED_STEP_IDS = [
  "realtime_inventory_fixture",
  "inventory_levels_update_webhook",
  "kitchen_qty_updated_within_budget",
  "realtime_sync_complete",
] as const;

export const SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_CHECK_NPM_SCRIPT =
  "check:shopify-realtime-inventory-sync-proof-p1-32" as const;

export const SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_CI_NPM_SCRIPT =
  "test:ci:shopify-realtime-inventory-sync-proof-p1-32" as const;

export const SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_UNIT_TEST =
  "tests/unit/shopify-realtime-inventory-sync-proof-p1-32.test.ts" as const;

export const SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_WIRING_PATHS = [
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_DOC,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_SERVICE,
  "services/integrations/shopify/inventory-sync.service.ts",
  "lib/webhooks/shopify-webhook-processor.ts",
  "services/integrations/shopify-inventory.ts",
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_E2E_SPEC,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_UNIT_TEST,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_ARTIFACT,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_CI_WORKFLOW,
] as const;
