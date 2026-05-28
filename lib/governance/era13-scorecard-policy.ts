/**
 * Evolution Era 13 scorecard policy — Cycle 5 refresh.
 *
 * Closes Era 13 enterprise delivery + operator depth cycles 1–4 from era12 handoff.
 */

export const ERA13_SCORECARD_POLICY_ID = "era13-scorecard-refresh-v1" as const;

export const ERA13_EXECUTION_MAP_STATUS = "completed" as const;

export type Era13CycleRecord = {
  cycle: number;
  title: string;
  policyId: string;
  backlogId: string;
};

export const ERA13_COMPLETED_CYCLES: readonly Era13CycleRecord[] = [
  {
    cycle: 1,
    title: "Enterprise identity recert",
    policyId: "era13-enterprise-identity-recert-v1",
    backlogId: "KOS-E13-001",
  },
  {
    cycle: 2,
    title: "KDS staging workflow secrets alignment",
    policyId: "era13-kds-staging-workflow-secrets-align-v1",
    backlogId: "KOS-E13-002",
  },
  {
    cycle: 3,
    title: "Staging workflows first-run ops",
    policyId: "era13-staging-workflows-first-run-ops-v1",
    backlogId: "KOS-E13-003",
  },
  {
    cycle: 4,
    title: "Production calendar operator depth",
    policyId: "era13-production-calendar-operator-depth-v1",
    backlogId: "KOS-E13-004",
  },
] as const;

/** Baseline = Era 12 end (canonical index). */
export const ERA13_SCORECARD_ROWS = [
  { area: "Overall", era12End: 99, era13End: 100, delta: 1 },
  { area: "Security", era12End: 82, era13End: 82, delta: 0 },
  { area: "QA", era12End: 91, era13End: 92, delta: 1 },
  { area: "DevOps", era12End: 97, era13End: 98, delta: 1 },
  { area: "RBAC", era12End: 89, era13End: 89, delta: 0 },
  { area: "Inventory", era12End: 72, era13End: 72, delta: 0 },
  { area: "POS", era12End: 74, era13End: 74, delta: 0 },
  { area: "Integrations", era12End: 59, era13End: 59, delta: 0 },
  { area: "KDS", era12End: 72, era13End: 73, delta: 1 },
  { area: "Enterprise readiness", era12End: 65, era13End: 66, delta: 1 },
  { area: "Marketing/sales", era12End: 82, era13End: 82, delta: 0 },
  { area: "Storefront", era12End: 83, era13End: 83, delta: 0 },
] as const;

export const ERA13_SCORECARD_DOCS = {
  scorecard: "docs/era13-cycle-completion-scorecard-2026-05-27.md",
  nextPromptInput: "docs/next-master-prompt-input-2026-05-27-era13.md",
  canonicalIndex: "docs/canonical-doc-index.md",
  era12Scorecard: "docs/era12-cycle-completion-scorecard-2026-05-27.md",
  era12PromptInput: "docs/next-master-prompt-input-2026-05-27-era12.md",
  strategicReaudit: "docs/full-strategic-reaudit-2026-05-27-era2.md",
} as const;

export const ERA13_GOVERNANCE_CERT_CHAIN_ANCHORS = [
  "test:ci:enterprise-identity-roadmap:cert",
  "test:ci:kds-realtime-e2e-staging:cert",
  "test:ci:e2e-staging-secrets-era12:cert",
  "test:ci:production-calendar-move-ui:cert",
] as const;

export const ERA13_ADDITIONAL_CERT_EVIDENCE = [
  "tests/unit/enterprise-identity-era13-cert-live.test.ts",
  "tests/unit/kds-staging-workflow-secrets-era13-cert-live.test.ts",
  "tests/unit/staging-workflows-first-run-era13-cert-live.test.ts",
  "tests/unit/production-calendar-operator-depth-era13-cert-live.test.ts",
] as const;

export const ERA13_REAUDIT_DECISION = {
  fullReauditRequiredNow: false,
  rationale:
    "Era 13 closed four enterprise/operator-depth cycles from era12 handoff; incremental scorecard + era13 prompt input sufficient until Era 14 theme or major commercial shift.",
} as const;
