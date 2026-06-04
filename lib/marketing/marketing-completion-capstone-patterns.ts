/**
 * MKT-42 — marketing completion capstone registry (MKT-39, MKT-40, MKT-41).
 *
 * @see lib/marketing/marketing-completion-capstone-audit-policy.ts
 */

export const MARKETING_COMPLETION_CAPSTONE_POLICY_ID =
  "marketing-completion-capstone-mkt42-v1" as const;

/** Top-level marketing capstones composed by MKT-42 completion audit. */
export const MARKETING_COMPLETION_CAPSTONE_SUB_POLICIES = [
  {
    id: "MKT-39",
    policyId: "marketing-full-stabilization-patterns-mkt39-v1",
    surface: "P0 + P1 + P2 tier stabilization (MKT-36–38)",
  },
  {
    id: "MKT-40",
    policyId: "marketing-claims-governance-capstone-mkt40-v1",
    surface: "Claims registry + CI governance + MKT-39",
  },
  {
    id: "MKT-41",
    policyId: "marketing-sales-playbook-capstone-mkt41-v1",
    surface: "Sales playbook hub + closing motion + MKT-40",
  },
] as const;
