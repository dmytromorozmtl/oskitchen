/**
 * EXEC-01 — six-role program completion capstone registry (task-181).
 *
 * @see lib/execution/program-completion-capstone-audit-policy.ts
 */

export const PROGRAM_COMPLETION_CAPSTONE_POLICY_ID =
  "program-completion-capstone-exec01-v1" as const;

/** Role completion capstones composed by EXEC-01 program audit. */
export const PROGRAM_COMPLETION_CAPSTONE_SUB_POLICIES = [
  {
    id: "DEV-56",
    policyId: "dev-beta-governance-capstone-dev56-v1",
    surface: "Developer BETA governance arc (DEV-49–DEV-55)",
  },
  {
    id: "QA-45",
    policyId: "beta-governance-smoke-chain-integration-v1",
    surface: "QA BETA governance smoke chain capstone",
  },
  {
    id: "DES-38",
    policyId: "stabilization-design-patterns-des38-v1",
    surface: "Design stabilization capstone (DES-27–37)",
  },
  {
    id: "MKT-42",
    policyId: "marketing-completion-capstone-mkt42-v1",
    surface: "Marketing completion (MKT-39–41)",
  },
  {
    id: "PM-06",
    policyId: "pm-completion-capstone-pm06-v1",
    surface: "Program management completion (PM-01–05)",
  },
  {
    id: "COMP-03",
    policyId: "competitor-completion-capstone-comp03-v1",
    surface: "Competitor intelligence completion (COMP-01–02)",
  },
] as const;
