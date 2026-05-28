/**
 * Evolution Era 15 scorecard policy — Cycle 6 refresh.
 *
 * Closes Era 15 ops / certification recert cycles 1–5 from era14 handoff (100/100 plateau).
 */

export const ERA15_SCORECARD_POLICY_ID = "era15-scorecard-refresh-v1" as const;

export const ERA15_EXECUTION_MAP_STATUS = "completed" as const;

export type Era15CycleRecord = {
  cycle: number;
  title: string;
  policyId: string;
  backlogId: string;
};

export const ERA15_COMPLETED_CYCLES: readonly Era15CycleRecord[] = [
  {
    cycle: 1,
    title: "KDS staging smoke recert",
    policyId: "era15-kds-staging-smoke-recert-v1",
    backlogId: "KOS-E15-001",
  },
  {
    cycle: 2,
    title: "Enterprise procurement recert",
    policyId: "era15-enterprise-procurement-recert-v1",
    backlogId: "KOS-E15-002",
  },
  {
    cycle: 3,
    title: "Staging workflows first-run recert",
    policyId: "era15-staging-workflows-first-run-recert-v1",
    backlogId: "KOS-E15-003",
  },
  {
    cycle: 4,
    title: "Typecheck slice recert",
    policyId: "era15-typecheck-slice-recert-v1",
    backlogId: "KOS-E15-004",
  },
  {
    cycle: 5,
    title: "Production calendar operator recert",
    policyId: "era15-production-calendar-operator-recert-v1",
    backlogId: "KOS-E15-005",
  },
] as const;

/** Baseline = Era 14 end (canonical index). */
export const ERA15_SCORECARD_ROWS = [
  { area: "Overall", era14End: 100, era15End: 100, delta: 0 },
  { area: "Security", era14End: 82, era15End: 82, delta: 0 },
  { area: "QA", era14End: 93, era15End: 94, delta: 1 },
  { area: "DevOps", era14End: 99, era15End: 100, delta: 1 },
  { area: "RBAC", era14End: 90, era15End: 90, delta: 0 },
  { area: "Inventory", era14End: 72, era15End: 72, delta: 0 },
  { area: "POS", era14End: 74, era15End: 74, delta: 0 },
  { area: "Integrations", era14End: 60, era15End: 60, delta: 0 },
  { area: "KDS", era14End: 73, era15End: 74, delta: 1 },
  { area: "Enterprise readiness", era14End: 66, era15End: 67, delta: 1 },
  { area: "Marketing/sales", era14End: 83, era15End: 83, delta: 0 },
  { area: "Storefront", era14End: 83, era15End: 83, delta: 0 },
] as const;

export const ERA15_SCORECARD_DOCS = {
  scorecard: "docs/era15-cycle-completion-scorecard-2026-05-27.md",
  nextPromptInput: "docs/next-master-prompt-input-2026-05-27-era15.md",
  canonicalIndex: "docs/canonical-doc-index.md",
  era14Scorecard: "docs/era14-cycle-completion-scorecard-2026-05-27.md",
  era14PromptInput: "docs/next-master-prompt-input-2026-05-27-era14.md",
  strategicReaudit: "docs/full-strategic-reaudit-2026-05-27-era2.md",
} as const;

export const ERA15_GOVERNANCE_CERT_CHAIN_ANCHORS = [
  "test:ci:kds-staging-smoke:cert",
  "test:ci:enterprise-procurement:cert",
  "test:ci:e2e-staging-secrets-era12:cert",
  "test:ci:typecheck-slice:cert",
  "test:ci:production-calendar-move-ui:cert",
] as const;

export const ERA15_PARENT_CERT_CHAINS = [
  {
    parent: "test:ci:kds-staging-smoke:cert",
    certLiveModule: "kds-staging-smoke-era15-cert-live",
  },
  {
    parent: "test:ci:enterprise-procurement:cert",
    certLiveModule: "enterprise-procurement-era15-cert-live",
  },
  {
    parent: "test:ci:e2e-staging-secrets-era12:cert",
    certLiveModule: "staging-workflows-first-run-era15-cert-live",
  },
  {
    parent: "test:ci:typecheck-slice:cert",
    certLiveModule: "typecheck-slice-era15-cert-live",
  },
  {
    parent: "test:ci:production-calendar-move-ui:cert",
    certLiveModule: "production-calendar-operator-depth-era15-cert-live",
  },
] as const;

export const ERA15_ADDITIONAL_CERT_EVIDENCE = [
  "tests/unit/kds-staging-smoke-era15-cert-live.test.ts",
  "tests/unit/enterprise-procurement-era15-cert-live.test.ts",
  "tests/unit/staging-workflows-first-run-era15-cert-live.test.ts",
  "tests/unit/typecheck-slice-era15-cert-live.test.ts",
  "tests/unit/production-calendar-operator-depth-era15-cert-live.test.ts",
] as const;

export const ERA15_SMOKE_SCRIPTS = [
  "smoke:kds-staging",
  "smoke:enterprise-procurement",
  "smoke:staging-workflows",
  "smoke:typecheck-slices",
  "smoke:production-calendar",
] as const;

export const ERA15_REAUDIT_DECISION = {
  fullReauditRequiredNow: false,
  rationale:
    "Era 15 closed five ops/certification recert cycles at the 100/100 plateau; incremental scorecard + era15 prompt input sufficient until Era 16 delivery theme (e.g. SSO R2) or major commercial shift.",
} as const;
