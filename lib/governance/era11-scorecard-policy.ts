/**
 * Evolution Era 11 scorecard policy — Cycle 5 refresh.
 *
 * Closes Era 11 DevOps scale / RBAC recert / KDS staging Playwright cycles 1–4 from era10 handoff.
 */

export const ERA11_SCORECARD_POLICY_ID = "era11-scorecard-refresh-v1" as const;

export const ERA11_EXECUTION_MAP_STATUS = "completed" as const;

export type Era11CycleRecord = {
  cycle: number;
  title: string;
  policyId: string;
  backlogId: string;
};

export const ERA11_COMPLETED_CYCLES: readonly Era11CycleRecord[] = [
  {
    cycle: 1,
    title: "Typecheck slice platform-auth",
    policyId: "era11-typecheck-slice-v3",
    backlogId: "KOS-E11-001",
  },
  {
    cycle: 2,
    title: "Mutation access Era 11 recert",
    policyId: "era11-mutation-access-recert-v1",
    backlogId: "KOS-E11-002",
  },
  {
    cycle: 3,
    title: "KDS Realtime Playwright staging",
    policyId: "era11-kds-realtime-e2e-staging-v1",
    backlogId: "KOS-E11-003",
  },
  {
    cycle: 4,
    title: "KDS staging Playwright workflow",
    policyId: "era11-kds-realtime-e2e-staging-workflow-v1",
    backlogId: "KOS-E11-004",
  },
] as const;

/** Baseline = Era 10 end (canonical index). */
export const ERA11_SCORECARD_ROWS = [
  { area: "Overall", era10End: 97, era11End: 98, delta: 1 },
  { area: "Security", era10End: 82, era11End: 82, delta: 0 },
  { area: "QA", era10End: 89, era11End: 90, delta: 1 },
  { area: "DevOps", era10End: 95, era11End: 96, delta: 1 },
  { area: "RBAC", era10End: 88, era11End: 89, delta: 1 },
  { area: "Inventory", era10End: 72, era11End: 72, delta: 0 },
  { area: "POS", era10End: 74, era11End: 74, delta: 0 },
  { area: "Integrations", era10End: 58, era11End: 58, delta: 0 },
  { area: "KDS", era10End: 70, era11End: 72, delta: 2 },
  { area: "Enterprise readiness", era10End: 65, era11End: 65, delta: 0 },
  { area: "Marketing/sales", era10End: 82, era11End: 82, delta: 0 },
  { area: "Storefront", era10End: 83, era11End: 83, delta: 0 },
] as const;

export const ERA11_SCORECARD_DOCS = {
  scorecard: "docs/era11-cycle-completion-scorecard-2026-05-27.md",
  nextPromptInput: "docs/next-master-prompt-input-2026-05-27-era11.md",
  canonicalIndex: "docs/canonical-doc-index.md",
  era10Scorecard: "docs/era10-cycle-completion-scorecard-2026-05-27.md",
  era10PromptInput: "docs/next-master-prompt-input-2026-05-27-era10.md",
  strategicReaudit: "docs/full-strategic-reaudit-2026-05-27-era2.md",
} as const;

/** Era 11 policy wiring anchored in governance partitions (chained certs). */
export const ERA11_GOVERNANCE_CERT_CHAIN_ANCHORS = [
  "test:ci:typecheck-slice:cert",
  "test:ci:mutation-access-consolidation:cert",
  "test:ci:kds-realtime-e2e-staging:cert",
] as const;

export const ERA11_ADDITIONAL_CERT_EVIDENCE = [
  "tests/unit/typecheck-slice-era11-cert-live.test.ts",
  "tests/unit/mutation-access-era11-cert-live.test.ts",
  "tests/unit/kds-realtime-e2e-staging-era11-cert-live.test.ts",
  "tests/unit/kds-realtime-e2e-staging-workflow-era11-cert-live.test.ts",
] as const;

export const ERA11_REAUDIT_DECISION = {
  fullReauditRequiredNow: false,
  rationale:
    "Era 11 closed four DevOps/RBAC/KDS staging cycles from era10 handoff; incremental scorecard + era11 prompt input sufficient until Era 12 theme or major commercial shift.",
} as const;
