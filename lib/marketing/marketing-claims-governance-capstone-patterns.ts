/**
 * MKT-40 — marketing claims governance capstone registry.
 *
 * @see lib/marketing/marketing-claims-governance-capstone-audit-policy.ts
 */

export const MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_POLICY_ID =
  "marketing-claims-governance-capstone-mkt40-v1" as const;

/** Claims governance surfaces composed by MKT-40 capstone. */
export const MARKETING_CLAIMS_GOVERNANCE_CAPSTONE_SUB_POLICIES = [
  {
    id: "claims-registry-doc",
    policyId: "sales-safe-claims-registry-mkt40-v1",
    surface: "docs/sales-safe-claims-registry.md",
  },
  {
    id: "claims-registry-json",
    policyId: "claims-registry-json-mkt40-v1",
    surface: "config/marketing/claims-registry.json",
  },
  {
    id: "governance-policy",
    policyId: "era7-marketing-claims-governance-v1",
    surface: "lib/governance/marketing-claims-governance-policy.ts",
  },
  {
    id: "verify-claims-ci",
    policyId: "verify-claims-ci-mkt40-v1",
    surface: ".github/workflows/verify-claims.yml",
  },
  {
    id: "forbidden-training",
    policyId: "forbidden-claims-training-mkt40-v1",
    surface: "docs/forbidden-claims-training.md",
  },
  {
    id: "MKT-39",
    policyId: "marketing-full-stabilization-patterns-mkt39-v1",
    surface: "MKT-36 through MKT-38 tier capstones",
  },
] as const;
