/**
 * POS-only inventory lock recert — Evolution Era 17 Workstream G Cycle 29.
 *
 * Reconfirms storefront/API/manual/integration orders do not deplete stock.
 * Does NOT unlock storefront depletion hook or unified cross-channel stock claims.
 */

import {
  INVENTORY_DEPLETION_GTM_LOCK_ID,
  INVENTORY_DEPLETION_POLICY_ID,
  INVENTORY_DEPLETION_STOREFRONT_HOOK_STATUS,
} from "@/lib/inventory/inventory-depletion-policy";

export const POS_ONLY_INVENTORY_LOCK_ERA17_POLICY_ID =
  "era17-pos-only-inventory-lock-v1" as const;

export const POS_ONLY_INVENTORY_LOCK_ERA17_DECISION_DATE = "2026-05-28" as const;

export const POS_ONLY_INVENTORY_LOCK_ERA17_EXTENDS_POLICIES = [
  INVENTORY_DEPLETION_POLICY_ID,
  INVENTORY_DEPLETION_GTM_LOCK_ID,
] as const;

/** Lock recertified — storefront hook remains deferred_locked. */
export const POS_ONLY_INVENTORY_LOCK_ERA17_PROOF_STATUS = "pos_only_lock_recertified" as const;

export const POS_ONLY_INVENTORY_LOCK_ERA17_DOC =
  "docs/pos-only-inventory-lock-era17.md" as const;

export const POS_ONLY_INVENTORY_LOCK_ERA17_SUMMARY_MODULE =
  "lib/inventory/pos-only-inventory-lock-summary.ts" as const;

export const POS_ONLY_INVENTORY_LOCK_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-only-inventory-lock-era17.ts" as const;

export const POS_ONLY_INVENTORY_LOCK_ERA17_SUMMARY_ARTIFACT =
  "artifacts/pos-only-inventory-lock-summary.json" as const;

export const POS_ONLY_INVENTORY_LOCK_ERA17_NPM_SCRIPT =
  "smoke:pos-only-inventory-lock" as const;

/** Production POS path — only certified depletion entrypoint. */
export const POS_ONLY_INVENTORY_LOCK_ERA17_POS_DEPLETION_ENTRYPOINTS = [
  "services/pos/pos-checkout-service.ts",
] as const;

/** Order paths that must remain free of POS depletion hooks (Era 17 expanded scan). */
export const POS_ONLY_INVENTORY_LOCK_ERA17_NON_DEPLETING_ENTRYPOINTS = [
  "actions/storefront-order.ts",
  "actions/order-creation.ts",
  "app/api/public/v1/orders/route.ts",
  "services/orders/order-creation-service.ts",
  "lib/webhooks/woocommerce-handler.ts",
  "lib/webhooks/shopify-handler.ts",
] as const;

export const POS_ONLY_INVENTORY_LOCK_ERA17_FORBIDDEN_HOOK_SYMBOLS = [
  "recordPendingInventoryImpactsForPosOrder",
  "applyRecipeDepletionForPosLine",
  "pos-inventory-impact-service",
] as const;

export const POS_ONLY_INVENTORY_LOCK_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Confirm era4-pos-only-v1 + era5-pos-only-gtm-lock-v1 still active — storefront hook deferred_locked.",
  "Scan non-POS order entrypoints — no recordPendingInventoryImpactsForPosOrder imports.",
  "Run npm run test:ci:inventory-depletion:cert — wiring + GTM lock + Era 17 recert PASS.",
  "Run npm run smoke:pos-only-inventory-lock — review artifacts/pos-only-inventory-lock-summary.json.",
  "Sales/pilot contracts: POS-only depletion wording only — no unified stock claim.",
  "Do not implement storefront depletion without explicit era unlock decision.",
] as const;

export const POS_ONLY_INVENTORY_LOCK_ERA17_CANONICAL_MARKERS = [
  POS_ONLY_INVENTORY_LOCK_ERA17_POLICY_ID,
  "smoke:pos-only-inventory-lock",
  "pos_only_lock_recertified",
  "deferred_locked",
  "pos-only-inventory-lock-summary",
] as const;

export const POS_ONLY_INVENTORY_LOCK_ERA17_FORBIDDEN_CLAIMS = [
  "unified inventory depletion",
  "storefront checkout depletes stock",
  "all channels deplete on-hand",
  "online orders automatically reduce inventory",
  "cross-channel stock sync on sale",
] as const;

export const POS_ONLY_INVENTORY_LOCK_ERA17_CI_SCRIPTS = [
  "test:ci:pos-only-inventory-lock-era17",
  "test:ci:pos-only-inventory-lock-era17:cert",
] as const;

export const POS_ONLY_INVENTORY_LOCK_ERA17_UNIT_TESTS = [
  "tests/unit/pos-only-inventory-lock-era17-policy.test.ts",
  "tests/unit/pos-only-inventory-lock-summary.test.ts",
  "tests/unit/pos-only-inventory-lock-era17-cert-live.test.ts",
] as const;

export const POS_ONLY_INVENTORY_LOCK_ERA17_CANONICAL_DOC_PATHS = [
  POS_ONLY_INVENTORY_LOCK_ERA17_DOC,
  "docs/feature-maturity-matrix.md",
  "docs/product-positioning.md",
  "docs/commercial-pilot-runbook.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
  "docs/enterprise-procurement-pack.md",
] as const;

export const POS_ONLY_INVENTORY_LOCK_ERA17_REVIEW_SECTION =
  "Era 17 POS-only inventory lock recert (2026-05-28)" as const;

export const POS_ONLY_INVENTORY_LOCK_ERA17_BACKLOG_ID = "KOS-E17-028" as const;

export const POS_ONLY_INVENTORY_LOCK_ERA17_STOREFRONT_HOOK_STATUS =
  INVENTORY_DEPLETION_STOREFRONT_HOOK_STATUS;
