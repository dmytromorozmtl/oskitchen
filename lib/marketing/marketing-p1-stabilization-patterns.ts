/**
 * MKT-37 — marketing P1 stabilization capstone registry (MKT-11 through MKT-28).
 *
 * @see lib/marketing/marketing-p1-stabilization-audit-policy.ts
 */

export const MARKETING_P1_STABILIZATION_PATTERNS_POLICY_ID =
  "marketing-p1-stabilization-patterns-mkt37-v1" as const;

/** P1 marketing sales/GTM policies composed by MKT-37 capstone. */
export const MARKETING_P1_STABILIZATION_SUB_POLICIES = [
  { id: "MKT-11", policyId: "case-study-template-mkt11-v1" },
  { id: "MKT-12", policyId: "demo-video-script-5min-mkt12-v1" },
  { id: "MKT-13", policyId: "shopify-bundle-gtm-mkt13-v1" },
  { id: "MKT-14", policyId: "qr-ordering-pilot-story-mkt14-v1" },
  { id: "MKT-15", policyId: "profit-engine-owner-margin-story-mkt15-v1" },
  { id: "MKT-16", policyId: "marketplace-b2b-supply-angle-mkt16-v1" },
  { id: "MKT-17", policyId: "ai-moats-honest-positioning-mkt17-v1" },
  { id: "MKT-18", policyId: "webinar-ghost-kitchens-mkt18-v1" },
  { id: "MKT-19", policyId: "email-nurture-5-sequence-mkt19-v1" },
  { id: "MKT-20", policyId: "seo-10-icp-keywords-mkt20-v1" },
  { id: "MKT-21", policyId: "discovery-call-script-mkt21-v1" },
  { id: "MKT-22", policyId: "demo-script-15min-mkt22-v1" },
  { id: "MKT-23", policyId: "objection-handling-mkt23-v1" },
  { id: "MKT-24", policyId: "pilot-proposal-template-mkt24-v1" },
  { id: "MKT-25", policyId: "roi-calculator-conservative-mkt25-v1" },
  { id: "MKT-26", policyId: "competitive-battle-cards-mkt26-v1" },
  { id: "MKT-27", policyId: "integration-honesty-screen-share-mkt27-v1" },
  { id: "MKT-28", policyId: "loi-template-walkthrough-mkt28-v1" },
] as const;
