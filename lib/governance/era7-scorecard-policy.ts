/**
 * Evolution Era 7 scorecard policy — Cycle 5 refresh.
 *
 * Closes Era 7 commercial-readiness cycles 1–4 from era6 prompt handoff.
 */

export const ERA7_SCORECARD_POLICY_ID = "era7-scorecard-refresh-v1" as const;

export const ERA7_EXECUTION_MAP_STATUS = "completed" as const;

export type Era7CycleRecord = {
  cycle: number;
  title: string;
  policyId: string;
  backlogId: string;
};

export const ERA7_COMPLETED_CYCLES: readonly Era7CycleRecord[] = [
  {
    cycle: 1,
    title: "Commercial pilot runbook",
    policyId: "era7-commercial-pilot-runbooks-v1",
    backlogId: "KOS-E7-001",
  },
  {
    cycle: 2,
    title: "Storefront Stripe E2E CI policy",
    policyId: "era7-storefront-stripe-optional-v1",
    backlogId: "KOS-E7-002",
  },
  {
    cycle: 3,
    title: "Repo hygiene (tests/node_modules)",
    policyId: "era7-tests-node-modules-hygiene-v1",
    backlogId: "KOS-E7-003",
  },
  {
    cycle: 4,
    title: "Marketing claims governance",
    policyId: "era7-marketing-claims-governance-v1",
    backlogId: "KOS-E7-004",
  },
] as const;

/** Baseline = Era 6 end (canonical index). */
export const ERA7_SCORECARD_ROWS = [
  { area: "Overall", era6End: 90, era7End: 92, delta: 2 },
  { area: "Security", era6End: 81, era7End: 81, delta: 0 },
  { area: "QA", era6End: 86, era7End: 87, delta: 1 },
  { area: "DevOps", era6End: 91, era7End: 92, delta: 1 },
  { area: "RBAC", era6End: 86, era7End: 86, delta: 0 },
  { area: "Inventory", era6End: 72, era7End: 72, delta: 0 },
  { area: "POS", era6End: 74, era7End: 74, delta: 0 },
  { area: "Integrations", era6End: 58, era7End: 58, delta: 0 },
  { area: "KDS", era6End: 67, era7End: 67, delta: 0 },
  { area: "Enterprise readiness", era6End: 62, era7End: 62, delta: 0 },
  { area: "Marketing/sales", era6End: 74, era7End: 79, delta: 5 },
  { area: "Storefront", era6End: 80, era7End: 83, delta: 3 },
] as const;

export const ERA7_SCORECARD_DOCS = {
  scorecard: "docs/era7-cycle-completion-scorecard-2026-05-27.md",
  nextPromptInput: "docs/next-master-prompt-input-2026-05-27-era7.md",
  canonicalIndex: "docs/canonical-doc-index.md",
  era6Scorecard: "docs/era6-cycle-completion-scorecard-2026-05-27.md",
  era6PromptInput: "docs/next-master-prompt-input-2026-05-27-era6.md",
  strategicReaudit: "docs/full-strategic-reaudit-2026-05-27-era2.md",
} as const;

/** Era 7 additions to governance `:cert` chain (full list = era6 + these). */
export const ERA7_GOVERNANCE_CERT_ADDITIONS = [
  "test:ci:commercial-pilot-runbook:cert",
  "test:ci:repo-hygiene:cert",
  "test:ci:marketing-claims-governance:cert",
] as const;

export const ERA7_ADDITIONAL_CERT_EVIDENCE = [
  "tests/unit/commercial-pilot-runbook-ci-live.test.ts",
  "tests/unit/storefront-stripe-e2e-secrets-policy-cert-live.test.ts",
  "tests/unit/repo-hygiene-ci-live.test.ts",
  "tests/unit/marketing-claims-governance-ci-live.test.ts",
] as const;

export const ERA7_REAUDIT_DECISION = {
  fullReauditRequiredNow: false,
  rationale:
    "Era 7 closed four commercial-readiness cycles from era6 handoff; incremental scorecard + era7 prompt input sufficient until Era 8 theme or major commercial shift.",
} as const;
