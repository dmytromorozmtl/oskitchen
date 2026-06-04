/**
 * MKT-39 — marketing full stabilization capstone registry (MKT-36, MKT-37, MKT-38 tier audits).
 *
 * @see lib/marketing/marketing-full-stabilization-audit-policy.ts
 */

export const MARKETING_FULL_STABILIZATION_PATTERNS_POLICY_ID =
  "marketing-full-stabilization-patterns-mkt39-v1" as const;

/** Tier capstone audits composed by MKT-39 full marketing stabilization. */
export const MARKETING_FULL_STABILIZATION_SUB_POLICIES = [
  {
    id: "MKT-38",
    policyId: "marketing-p0-stabilization-patterns-mkt38-v1",
    tier: "P0",
    surface: "MKT-01 through MKT-10",
  },
  {
    id: "MKT-37",
    policyId: "marketing-p1-stabilization-patterns-mkt37-v1",
    tier: "P1",
    surface: "MKT-11 through MKT-28",
  },
  {
    id: "MKT-36",
    policyId: "marketing-p2-stabilization-patterns-mkt36-v1",
    tier: "P2",
    surface: "MKT-29 through MKT-35",
  },
] as const;
