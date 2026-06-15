/**
 * PM-02 — commercial pilot GO/NO-GO capstone registry.
 *
 * @see lib/pm/pm-pilot-gono-go-capstone-audit-policy.ts
 */

export const PM_PILOT_GONO_GO_CAPSTONE_POLICY_ID = "pm-pilot-gono-go-capstone-pm02-v1" as const;

/** GO/NO-GO governance surfaces composed by PM-02 capstone. */
export const PM_PILOT_GONO_GO_CAPSTONE_SUB_POLICIES = [
  {
    id: "commercial-runbook",
    policyId: "era7-commercial-pilot-runbooks-v1",
    surface: "docs/commercial-pilot-runbook.md",
  },
  {
    id: "gono-go-artifact",
    policyId: "era17-pilot-gono-go-v1",
    surface: "artifacts/pilot-gono-go-summary.json",
  },
  {
    id: "gono-go-integrity",
    policyId: "era28-pilot-gono-go-integrity-v1",
    surface: "lib/commercial/pilot-gono-go-integrity-era28.ts",
  },
  {
    id: "PM-01",
    policyId: "pm-p0-foundation-patterns-pm01-v1",
    surface: "P0 PM foundation deliverables",
  },
] as const;
