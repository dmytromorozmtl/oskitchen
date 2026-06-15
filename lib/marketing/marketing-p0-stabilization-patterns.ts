/**
 * MKT-38 — marketing P0 stabilization capstone registry (MKT-01 through MKT-10).
 *
 * @see lib/marketing/marketing-p0-stabilization-audit-policy.ts
 */

export const MARKETING_P0_STABILIZATION_PATTERNS_POLICY_ID =
  "marketing-p0-stabilization-patterns-mkt38-v1" as const;

/** P0 marketing foundation deliverables composed by MKT-38 capstone. */
export const MARKETING_P0_STABILIZATION_SUB_POLICIES = [
  { id: "MKT-01", policyId: "forbidden-claims-training-mkt01-v1", surface: "docs/forbidden-claims-training.md" },
  { id: "MKT-02", policyId: "icp-definition-final-mkt02-v1", surface: "docs/icp-definition-final.md" },
  { id: "MKT-03", policyId: "loi-outreach-email-mkt03-v1", surface: "docs/loi-outreach-email.md" },
  { id: "MKT-04", policyId: "pilot-pricing-page-mkt04-v1", surface: "app/pricing/page.tsx" },
  { id: "MKT-05", policyId: "competitor-comparison-honest-mkt05-v1", surface: "docs/competitor-comparison-honest.md" },
  { id: "MKT-06", policyId: "integration-health-landing-mkt06-v1", surface: "app/page.tsx" },
  { id: "MKT-07", policyId: "software-first-pos-mkt07-v1", surface: "docs/software-first-pos-positioning.md" },
  { id: "MKT-08", policyId: "trust-page-mkt08-v1", surface: "app/trust/page.tsx" },
  { id: "MKT-09", policyId: "verify-claims-ci-mkt09-v1", surface: ".github/workflows/verify-claims.yml" },
  { id: "MKT-10", policyId: "series-a-hold-notice-mkt10-v1", surface: "docs/series-a-hold-notice.md" },
] as const;
