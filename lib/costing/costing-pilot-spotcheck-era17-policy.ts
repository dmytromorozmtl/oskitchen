/**
 * Costing pilot spot check — Evolution Era 17 Workstream G Cycle 31 (engineering Cycle 30).
 *
 * Documents and test-backs recipe → margin report math for pilot menu QA.
 * Does NOT claim full ERP costing parity or accountant-certified margins.
 */

export const COSTING_PILOT_SPOTCHECK_ERA17_POLICY_ID =
  "era17-costing-pilot-spotcheck-v1" as const;

export const COSTING_PILOT_SPOTCHECK_ERA17_DECISION_DATE = "2026-05-28" as const;

export const COSTING_PILOT_SPOTCHECK_ERA17_PROOF_STATUS =
  "pilot_menu_margin_spotcheck_documented" as const;

export const COSTING_PILOT_SPOTCHECK_ERA17_MATH_MODULE =
  "lib/costing/costing-pilot-menu-spotcheck-math.ts" as const;

export const COSTING_PILOT_SPOTCHECK_ERA17_OPERATOR_DOC =
  "docs/costing-pilot-spotcheck-era17.md" as const;

export const COSTING_PILOT_SPOTCHECK_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-costing-pilot-spotcheck-era17.ts" as const;

export const COSTING_PILOT_SPOTCHECK_ERA17_SUMMARY_ARTIFACT =
  "artifacts/costing-pilot-spotcheck-summary.json" as const;

export const COSTING_PILOT_SPOTCHECK_ERA17_NPM_SCRIPT =
  "smoke:costing-pilot-spotcheck" as const;

export const COSTING_PILOT_SPOTCHECK_ERA17_SPOTCHECK_STEPS = [
  "Configure 2–3 pilot menu items with active recipes and ingredient costs on staging",
  "Run Recalculate costing from /dashboard/costing (requires reports.read.financial)",
  "Open /dashboard/reports/margin_report — confirm rows appear for pilot recipes",
  "Spot-check one item: food cost % ≈ ingredient cost ÷ selling price",
  "Spot-check same item: margin % ≈ (selling price − total cost) ÷ selling price",
  "Note margin_report 'Food cost' column shows total modeled cost — food cost % is ingredient-based",
  "Run npm run smoke:costing-pilot-spotcheck — review costing-pilot-spotcheck-summary.json",
] as const;

export const COSTING_PILOT_SPOTCHECK_ERA17_EDGE_CASES = [
  "foodCostPct = ingredientCostPerUnit / salePrice × 100",
  "marginPct = (salePrice - totalCost) / salePrice × 100",
  "margin_report foodCost column maps to profitabilityLine.totalCost (not ingredient-only)",
  "recalculateCostSnapshotsAction requires reports.read.financial",
  "zero sale price yields 0% food cost and margin in calculations",
] as const;

export const COSTING_PILOT_SPOTCHECK_ERA17_CANONICAL_MARKERS = [
  COSTING_PILOT_SPOTCHECK_ERA17_POLICY_ID,
  "smoke:costing-pilot-spotcheck",
  "pilot_menu_margin_spotcheck_documented",
  "costing-pilot-menu-spotcheck-math",
  "marginReportRowConsistent",
] as const;

export const COSTING_PILOT_SPOTCHECK_ERA17_FORBIDDEN_CLAIMS = [
  "accountant-certified food cost",
  "lightspeed costing parity",
  "real-time margin across all channels",
  "automated invoice reconciliation in pilot",
] as const;

export const COSTING_PILOT_SPOTCHECK_ERA17_CI_SCRIPTS = [
  "test:ci:costing-pilot-spotcheck-era17",
  "test:ci:costing-pilot-spotcheck-era17:cert",
] as const;

export const COSTING_PILOT_SPOTCHECK_ERA17_UNIT_TESTS = [
  "tests/unit/costing-pilot-menu-spotcheck-math.test.ts",
  "tests/unit/costing-pilot-spotcheck-era17-policy.test.ts",
  "tests/unit/costing-pilot-spotcheck-era17-cert-live.test.ts",
  "tests/unit/costing-actions-rbac.test.ts",
] as const;

export const COSTING_PILOT_SPOTCHECK_ERA17_CANONICAL_DOC_PATHS = [
  COSTING_PILOT_SPOTCHECK_ERA17_OPERATOR_DOC,
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
  "docs/pilot-icp-contract-template-era17.md",
  "docs/COSTING_REPORTS.md",
] as const;

export const COSTING_PILOT_SPOTCHECK_ERA17_REVIEW_SECTION =
  "Era 17 costing pilot spot check (2026-05-28)" as const;

export const COSTING_PILOT_SPOTCHECK_ERA17_BACKLOG_ID = "KOS-E17-030" as const;

export const COSTING_PILOT_SPOTCHECK_ERA17_REQUIRED_PERMISSION =
  "reports.read.financial" as const;
