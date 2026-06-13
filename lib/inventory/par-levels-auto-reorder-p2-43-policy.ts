/**
 * Blueprint P2-43 — Par levels + auto-reorder (MarketMan parity).
 *
 * stock < par → reorder queue → draft PO grouped by supplier
 *
 * @see docs/par-levels-auto-reorder-p2-43.md
 */

export const PAR_LEVELS_AUTO_REORDER_P2_43_POLICY_ID = "par-levels-auto-reorder-p2-43-v1" as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_DOC = "docs/par-levels-auto-reorder-p2-43.md" as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_ARTIFACT =
  "artifacts/par-levels-auto-reorder-p2-43-registry.json" as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_REORDER_ROUTE =
  "/dashboard/purchasing/reorder-queue" as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_PURCHASING_ROUTE = "/dashboard/purchasing" as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_SERVICE =
  "services/inventory/par-levels-auto-reorder-service.ts" as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_ACTIONS = "app/dashboard/purchasing/actions.ts" as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_REORDER_PAGE =
  "app/dashboard/purchasing/reorder-queue/page.tsx" as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_ROOT_TEST_ID = "par-levels-reorder-root" as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_SYNC_TEST_ID = "par-levels-sync-button" as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_DRAFT_PO_TEST_ID = "par-levels-draft-po-button" as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_AUDIT_SCRIPT =
  "scripts/audit-par-levels-auto-reorder-p2-43.ts" as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_NPM_SCRIPT = "audit:par-levels-auto-reorder-p2-43" as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_CHECK_NPM_SCRIPT =
  "check:par-levels-auto-reorder-p2-43" as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_UNIT_TEST =
  "tests/unit/par-levels-auto-reorder-p2-43.test.ts" as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_FLOW_STEPS = [
  "sync_par_levels_to_queue",
  "review_reorder_queue",
  "generate_draft_pos_by_supplier",
  "buyer_approval",
] as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_HONESTY_MARKERS = [
  "MarketMan parity",
  "par level",
  "auto-reorder",
  "draft PO",
] as const;

export const PAR_LEVELS_AUTO_REORDER_P2_43_WIRING_PATHS = [
  PAR_LEVELS_AUTO_REORDER_P2_43_DOC,
  "lib/inventory/par-levels-auto-reorder-p2-43-audit.ts",
  "lib/inventory/par-levels-auto-reorder-p2-43-measurement.ts",
  PAR_LEVELS_AUTO_REORDER_P2_43_SERVICE,
  PAR_LEVELS_AUTO_REORDER_P2_43_UNIT_TEST,
  PAR_LEVELS_AUTO_REORDER_P2_43_ARTIFACT,
] as const;
