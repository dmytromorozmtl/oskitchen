/**
 * COMP-01 — P0 competitor intelligence capstone registry.
 *
 * @see lib/competitor/competitor-p0-intelligence-audit-policy.ts
 */

export const COMPETITOR_P0_INTELLIGENCE_POLICY_ID =
  "competitor-p0-intelligence-comp01-v1" as const;

/** P0 competitor intelligence surfaces composed by COMP-01 capstone. */
export const COMPETITOR_P0_INTELLIGENCE_SUB_POLICIES = [
  {
    id: "COMP-01a",
    policyId: "competitor-comparison-honest-v1",
    surface: "docs/competitor-comparison-honest.md",
  },
  {
    id: "COMP-01b",
    policyId: "competitor-feature-tracker-v1",
    surface: "artifacts/competitor-feature-tracker.json",
  },
  {
    id: "COMP-01c",
    policyId: "competitive-battle-cards-mkt26-v1",
    surface: "docs/competitive-battle-cards.md",
  },
  {
    id: "COMP-01d",
    policyId: "era17-competitor-feature-gap-matrix-refresh-v1",
    surface: "docs/competitor-feature-gap-matrix.md + artifacts/competitor-feature-gap-matrix-summary.json",
  },
  {
    id: "COMP-01e",
    policyId: "toast-gap-analysis-public-summary-mkt34-v1",
    surface: "docs/toast-gap-analysis.md",
  },
] as const;
