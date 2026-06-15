/**
 * PM-01 — P0 program management foundation capstone registry.
 *
 * @see lib/pm/pm-p0-foundation-audit-policy.ts
 */

export const PM_P0_FOUNDATION_PATTERNS_POLICY_ID = "pm-p0-foundation-patterns-pm01-v1" as const;

/** P0 PM foundation deliverables composed by PM-01 capstone. */
export const PM_P0_FOUNDATION_SUB_POLICIES = [
  {
    id: "PM-01a",
    policyId: "design-partner-loi-pm01a-v1",
    surface: "docs/loi-design-partner-template.md",
  },
  {
    id: "PM-01b",
    policyId: "pilot-execution-checklist-pm01b-v1",
    surface: "docs/pilot-execution-checklist.md",
  },
  {
    id: "PM-01c",
    policyId: "live-integration-dod-pm01c-v1",
    surface: "docs/live-integration-definition-of-done.md",
  },
  {
    id: "PM-01d",
    policyId: "staging-environment-checklist-pm01d-v1",
    surface: "docs/staging-environment-checklist.md",
  },
  {
    id: "PM-01e",
    policyId: "migration-deployment-process-pm01e-v1",
    surface: "docs/migration-deployment-process.md",
  },
] as const;
