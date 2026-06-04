/**
 * PM-05 — strategic planning capstone registry.
 *
 * @see lib/pm/pm-strategic-planning-capstone-audit-policy.ts
 */

export const PM_STRATEGIC_PLANNING_CAPSTONE_POLICY_ID =
  "pm-strategic-planning-capstone-pm05-v1" as const;

/** Strategic planning deliverables composed by PM-05 capstone. */
export const PM_STRATEGIC_PLANNING_CAPSTONE_SUB_POLICIES = [
  {
    id: "q3-okrs",
    policyId: "q3-2026-okrs-v1",
    surface: "docs/q3-2026-okrs.md",
  },
  {
    id: "series-a-narrative",
    policyId: "series-a-narrative-v1",
    surface: "docs/series-a-narrative.md",
  },
  {
    id: "series-a-hold",
    policyId: "series-a-hold-notice-mkt10-v1",
    surface: "docs/series-a-hold-notice.md",
  },
  {
    id: "soc2-readiness",
    policyId: "soc2-readiness-assessment-v1",
    surface: "docs/soc2-readiness-assessment.md",
  },
  {
    id: "marketplace-pricing",
    policyId: "marketplace-pricing-strategy-v1",
    surface: "docs/marketplace-pricing-strategy.md",
  },
  {
    id: "PM-04",
    policyId: "pm-customer-gtm-capstone-pm04-v1",
    surface: "customer success + competitor GTM + PM-03 chain",
  },
] as const;
