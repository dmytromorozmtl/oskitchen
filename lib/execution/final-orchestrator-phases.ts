/**
 * Final orchestrator phase registry — task slots 195–220 (FINAL-01 through FINAL-26).
 *
 * @see lib/execution/execution-tracker-slot-registry.ts
 */

export const FINAL_ORCHESTRATOR_PHASE_COUNT = 26 as const;

export const FINAL_ORCHESTRATOR_FIRST_TASK_SLOT = 195 as const;

export type FinalOrchestratorPhaseEntry = {
  id: string;
  taskSlot: number;
  policyId: string;
  surface: string;
  summary: string;
};

/** Ordered final closure phases after EXEC-02 reconciliation. */
export const FINAL_ORCHESTRATOR_PHASES: readonly FinalOrchestratorPhaseEntry[] = [
  {
    id: "FINAL-01",
    taskSlot: 195,
    policyId: "final-01-vault-gate-v1",
    surface: "artifacts/vault-readiness-report.json + docs/ops-vault-matrix.md",
    summary: "Ops vault readiness gate (honest P0 artifact status)",
  },
  {
    id: "FINAL-02",
    taskSlot: 196,
    policyId: "final-02-p0-orchestrator-artifact-v1",
    surface: "artifacts/p0-orchestrator-staging-run-summary.json",
    summary: "P0 orchestrator staging artifact honesty",
  },
  {
    id: "FINAL-03",
    taskSlot: 197,
    policyId: "final-03-pilot-gono-go-v1",
    surface: "artifacts/pilot-gono-go-summary.json",
    summary: "Pilot GO/NO-GO integrity gate",
  },
  {
    id: "FINAL-04",
    taskSlot: 198,
    policyId: "final-04-live-integration-dod-v1",
    surface: "artifacts/smoke-live-integration-dod-summary.json",
    summary: "LIVE integration DoD smoke (0 LIVE claim)",
  },
  {
    id: "FINAL-05",
    taskSlot: 199,
    policyId: "final-05-beta-governance-chain-v1",
    surface: "BETA governance smoke chain",
    summary: "Registry → integrity → DoD chain",
  },
  {
    id: "FINAL-06",
    taskSlot: 200,
    policyId: "final-06-program-capstone-v1",
    surface: "EXEC-01 six-role capstone",
    summary: "Program completion capstone re-cert",
  },
  {
    id: "FINAL-07",
    taskSlot: 201,
    policyId: "final-07-tracker-reconciliation-v1",
    surface: "EXEC-02 tracker reconciliation",
    summary: "220-slot tracker reconciliation",
  },
  {
    id: "FINAL-08",
    taskSlot: 202,
    policyId: "final-08-forbidden-claims-v1",
    surface: ".github/workflows/verify-claims.yml",
    summary: "Marketing claims CI gate",
  },
  {
    id: "FINAL-09",
    taskSlot: 203,
    policyId: "final-09-competitor-intelligence-v1",
    surface: "COMP-03 competitor completion",
    summary: "Competitor intelligence capstone",
  },
  {
    id: "FINAL-10",
    taskSlot: 204,
    policyId: "final-10-pm-completion-v1",
    surface: "PM-06 program management capstone",
    summary: "PM completion capstone",
  },
  {
    id: "FINAL-11",
    taskSlot: 205,
    policyId: "final-11-marketing-completion-v1",
    surface: "MKT-42 marketing completion",
    summary: "Marketing completion capstone",
  },
  {
    id: "FINAL-12",
    taskSlot: 206,
    policyId: "final-12-design-stabilization-v1",
    surface: "DES-38 stabilization design",
    summary: "Design stabilization capstone",
  },
  {
    id: "FINAL-13",
    taskSlot: 207,
    policyId: "final-13-ts-build-green-v1",
    surface: "npx tsc --noEmit + npm run build",
    summary: "Typecheck and production build green",
  },
  {
    id: "FINAL-14",
    taskSlot: 208,
    policyId: "final-14-vitest-health-v1",
    surface: "npm test vitest summary",
    summary: "Unit test health snapshot",
  },
  {
    id: "FINAL-15",
    taskSlot: 209,
    policyId: "final-15-e2e-golden-path-v1",
    surface: "e2e/dashboard-rsc-regression.spec.ts",
    summary: "Dashboard RSC golden path",
  },
  {
    id: "FINAL-16",
    taskSlot: 210,
    policyId: "final-16-cross-tenant-v1",
    surface: "e2e/cross-tenant-isolation-staging.spec.ts",
    summary: "Cross-tenant isolation staging",
  },
  {
    id: "FINAL-17",
    taskSlot: 211,
    policyId: "final-17-webhook-signature-v1",
    surface: "tests/unit/webhook-signature-matrix.test.ts",
    summary: "Webhook signature matrix",
  },
  {
    id: "FINAL-18",
    taskSlot: 212,
    policyId: "final-18-integration-health-v1",
    surface: "Integration Health strip + page",
    summary: "Integration Health moat surfaces",
  },
  {
    id: "FINAL-19",
    taskSlot: 213,
    policyId: "final-19-trust-page-v1",
    surface: "app/trust/page.tsx",
    summary: "BETA/PREVIEW/SKIPPED trust page",
  },
  {
    id: "FINAL-20",
    taskSlot: 214,
    policyId: "final-20-sales-playbook-v1",
    surface: "docs/SALES_PLAYBOOK.md",
    summary: "Sales-safe playbook hub",
  },
  {
    id: "FINAL-21",
    taskSlot: 215,
    policyId: "final-21-commercial-pilot-runbook-v1",
    surface: "docs/commercial-pilot-runbook.md",
    summary: "Commercial pilot runbook",
  },
  {
    id: "FINAL-22",
    taskSlot: 216,
    policyId: "final-22-final-execution-json-v1",
    surface: "artifacts/final-execution-report.json",
    summary: "Final execution JSON artifact sync",
  },
  {
    id: "FINAL-23",
    taskSlot: 217,
    policyId: "final-23-final-execution-doc-v1",
    surface: "docs/final-execution-report.md",
    summary: "Final execution markdown report",
  },
  {
    id: "FINAL-24",
    taskSlot: 218,
    policyId: "final-24-execution-log-v1",
    surface: "artifacts/execution-log.txt",
    summary: "Execution log cycle continuity",
  },
  {
    id: "FINAL-25",
    taskSlot: 219,
    policyId: "final-25-tracker-219-v1",
    surface: "artifacts/execution-tracker-final.json",
    summary: "Pre-closure tracker snapshot",
  },
  {
    id: "FINAL-26",
    taskSlot: 220,
    policyId: "final-26-all-tasks-done-v1",
    surface: "artifacts/execution-tracker-final.json (all done)",
    summary: "All 220 task slots marked done",
  },
] as const;

export function getFinalOrchestratorPhase(phaseId: string): FinalOrchestratorPhaseEntry | undefined {
  return FINAL_ORCHESTRATOR_PHASES.find((phase) => phase.id === phaseId);
}
