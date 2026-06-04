/**
 * MKT-36 — marketing P2 stabilization capstone registry (MKT-29 through MKT-35).
 *
 * @see lib/marketing/marketing-p2-stabilization-audit-policy.ts
 */

export const MARKETING_P2_STABILIZATION_PATTERNS_POLICY_ID =
  "marketing-p2-stabilization-patterns-mkt36-v1" as const;

/** P2 marketing GTM policies composed by MKT-36 capstone. */
export const MARKETING_P2_STABILIZATION_SUB_POLICIES = [
  {
    id: "MKT-29",
    policyId: "press-release-first-design-partner-mkt29-v1",
    module: "press-release-first-design-partner-policy",
  },
  {
    id: "MKT-30",
    policyId: "product-hunt-launch-defer-mkt30-v1",
    module: "product-hunt-launch-defer-policy",
  },
  {
    id: "MKT-31",
    policyId: "partner-program-shopify-agencies-mkt31-v1",
    module: "partner-program-shopify-agencies-policy",
  },
  {
    id: "MKT-32",
    policyId: "referral-program-mkt32-v1",
    module: "referral-program-policy",
  },
  {
    id: "MKT-33",
    policyId: "state-of-ghost-kitchen-ops-mkt33-v1",
    module: "state-of-ghost-kitchen-ops-report-policy",
  },
  {
    id: "MKT-34",
    policyId: "toast-gap-analysis-public-summary-mkt34-v1",
    module: "toast-gap-analysis-public-summary-policy",
  },
  {
    id: "MKT-35",
    policyId: "analyst-briefing-deck-mkt35-v1",
    module: "analyst-briefing-deck-policy",
  },
] as const;

export type MarketingP2StabilizationSubPolicy =
  (typeof MARKETING_P2_STABILIZATION_SUB_POLICIES)[number];
