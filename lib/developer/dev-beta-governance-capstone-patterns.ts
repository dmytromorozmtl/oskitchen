/**
 * DEV-56 — BETA integration governance completion capstone registry (DEV-49–DEV-55 arc).
 *
 * @see lib/developer/dev-beta-governance-capstone-audit-policy.ts
 */

export const DEV_BETA_GOVERNANCE_CAPSTONE_POLICY_ID =
  "dev-beta-governance-capstone-dev56-v1" as const;

/** DEV-55 arc deliverables composed by developer governance capstone. */
export const DEV_BETA_GOVERNANCE_CAPSTONE_SUB_POLICIES = [
  {
    id: "DEV-55a",
    policyId: "era17-live-integration-dod-smoke-v1",
    surface: "docs/live-integration-dod-smoke.md + scripts/smoke-live-integration-dod-era17.ts",
  },
  {
    id: "DEV-55b",
    policyId: "p0-orchestrator-live-dod-tier1-v1",
    surface: ".github/workflows/p0-orchestrator.yml",
  },
  {
    id: "DEV-55c",
    policyId: "smoke-live-integration-dod-summary-v1",
    surface: "artifacts/smoke-live-integration-dod-summary.json",
  },
] as const;
