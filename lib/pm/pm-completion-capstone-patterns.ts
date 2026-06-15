/**
 * PM-06 — program management completion capstone registry (PM-01 through PM-05).
 *
 * @see lib/pm/pm-completion-capstone-audit-policy.ts
 */

export const PM_COMPLETION_CAPSTONE_POLICY_ID = "pm-completion-capstone-pm06-v1" as const;

/** Top-level PM capstones composed by PM-06 completion audit. */
export const PM_COMPLETION_CAPSTONE_SUB_POLICIES = [
  {
    id: "PM-01",
    policyId: "pm-p0-foundation-patterns-pm01-v1",
    surface: "P0 foundation (LOI, pilot checklist, LIVE DoD, staging, migrations)",
  },
  {
    id: "PM-02",
    policyId: "pm-pilot-gono-go-capstone-pm02-v1",
    surface: "commercial pilot runbook + GO/NO-GO integrity",
  },
  {
    id: "PM-03",
    policyId: "pm-ops-governance-capstone-pm03-v1",
    surface: "incident, escalation, triage, era freeze governance",
  },
  {
    id: "PM-04",
    policyId: "pm-customer-gtm-capstone-pm04-v1",
    surface: "customer success, demo env, competitor intelligence",
  },
  {
    id: "PM-05",
    policyId: "pm-strategic-planning-capstone-pm05-v1",
    surface: "OKRs, Series A, SOC2, marketplace pricing",
  },
] as const;
