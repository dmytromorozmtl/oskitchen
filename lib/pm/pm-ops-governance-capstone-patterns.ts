/**
 * PM-03 — program ops governance capstone registry.
 *
 * @see lib/pm/pm-ops-governance-capstone-audit-policy.ts
 */

export const PM_OPS_GOVERNANCE_CAPSTONE_POLICY_ID = "pm-ops-governance-capstone-pm03-v1" as const;

/** Ops governance surfaces composed by PM-03 capstone. */
export const PM_OPS_GOVERNANCE_CAPSTONE_SUB_POLICIES = [
  {
    id: "incident-response",
    policyId: "incident-response-process-v1",
    surface: "docs/incident-response-process.md",
  },
  {
    id: "integration-escalation",
    policyId: "integration-escalation-matrix-v1",
    surface: "docs/integration-escalation-matrix.md",
  },
  {
    id: "bug-triage",
    policyId: "bug-triage-process-v1",
    surface: "docs/bug-triage-process.md",
  },
  {
    id: "era-freeze-governance",
    policyId: "era60-era25-convergence-governance-terminus-freeze-integrity-v1",
    surface: "docs/next-step-era25-convergence-governance-terminus-freeze-phase-aj-product-2026-05-28.md",
  },
  {
    id: "PM-02",
    policyId: "pm-pilot-gono-go-capstone-pm02-v1",
    surface: "commercial pilot GO/NO-GO + PM-01 foundation",
  },
] as const;
