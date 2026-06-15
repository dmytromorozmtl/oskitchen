/**
 * Evolution Era 14 scorecard policy — Cycle 6 refresh.
 *
 * Closes Era 14 GTM honesty / recert cycles 1–5 from era13 handoff (100/100 plateau).
 */

export const ERA14_SCORECARD_POLICY_ID = "era14-scorecard-refresh-v1" as const;

export const ERA14_EXECUTION_MAP_STATUS = "completed" as const;

export type Era14CycleRecord = {
  cycle: number;
  title: string;
  policyId: string;
  backlogId: string;
};

export const ERA14_COMPLETED_CYCLES: readonly Era14CycleRecord[] = [
  {
    cycle: 1,
    title: "Nav page maturity recert",
    policyId: "era14-nav-page-maturity-recert-v1",
    backlogId: "KOS-E14-001",
  },
  {
    cycle: 2,
    title: "Cross-channel rewards recert",
    policyId: "era14-cross-channel-rewards-recert-v1",
    backlogId: "KOS-E14-002",
  },
  {
    cycle: 3,
    title: "Mutation access consolidation recert",
    policyId: "era14-mutation-access-consolidation-recert-v1",
    backlogId: "KOS-E14-003",
  },
  {
    cycle: 4,
    title: "Cron surface recert",
    policyId: "era14-cron-surface-recert-v1",
    backlogId: "KOS-E14-004",
  },
  {
    cycle: 5,
    title: "Channel golden path recert",
    policyId: "era14-channel-golden-path-recert-v1",
    backlogId: "KOS-E14-005",
  },
] as const;

/** Baseline = Era 13 end (canonical index). */
export const ERA14_SCORECARD_ROWS = [
  { area: "Overall", era13End: 100, era14End: 100, delta: 0 },
  { area: "Security", era13End: 82, era14End: 82, delta: 0 },
  { area: "QA", era13End: 92, era14End: 93, delta: 1 },
  { area: "DevOps", era13End: 98, era14End: 99, delta: 1 },
  { area: "RBAC", era13End: 89, era14End: 90, delta: 1 },
  { area: "Inventory", era13End: 72, era14End: 72, delta: 0 },
  { area: "POS", era13End: 74, era14End: 74, delta: 0 },
  { area: "Integrations", era13End: 59, era14End: 60, delta: 1 },
  { area: "KDS", era13End: 73, era14End: 73, delta: 0 },
  { area: "Enterprise readiness", era13End: 66, era14End: 66, delta: 0 },
  { area: "Marketing/sales", era13End: 82, era14End: 83, delta: 1 },
  { area: "Storefront", era13End: 83, era14End: 83, delta: 0 },
] as const;

export const ERA14_SCORECARD_DOCS = {
  scorecard: "docs/era14-cycle-completion-scorecard-2026-05-27.md",
  nextPromptInput: "docs/next-master-prompt-input-2026-05-27-era14.md",
  canonicalIndex: "docs/canonical-doc-index.md",
  era13Scorecard: "docs/era13-cycle-completion-scorecard-2026-05-27.md",
  era13PromptInput: "docs/next-master-prompt-input-2026-05-27-era13.md",
  strategicReaudit: "docs/full-strategic-reaudit-2026-05-27-era2.md",
} as const;

/** Parent certs wired in `test:ci:governance-bundles` partitions (each chains era14 cert-live). */
export const ERA14_GOVERNANCE_CERT_CHAIN_ANCHORS = [
  "test:ci:cross-channel-rewards:cert",
  "test:ci:cron-hygiene:cert",
  "test:ci:channel-golden-path:cert",
] as const;

/** Era14 cert-live modules chained from parent scripts outside governance partition names. */
export const ERA14_PARENT_CERT_CHAINS = [
  {
    parent: "test:ci:page-maturity-sweep:cert",
    certLiveModule: "nav-page-maturity-era14-cert-live",
  },
  {
    parent: "test:ci:mutation-access-consolidation:cert",
    certLiveModule: "mutation-access-era14-cert-live",
  },
] as const;

export const ERA14_ADDITIONAL_CERT_EVIDENCE = [
  "tests/unit/nav-page-maturity-era14-cert-live.test.ts",
  "tests/unit/cross-channel-rewards-era14-cert-live.test.ts",
  "tests/unit/mutation-access-era14-cert-live.test.ts",
  "tests/unit/cron-surface-era14-cert-live.test.ts",
  "tests/unit/channel-golden-path-era14-cert-live.test.ts",
] as const;

export const ERA14_REAUDIT_DECISION = {
  fullReauditRequiredNow: false,
  rationale:
    "Era 14 closed five honesty/recert cycles at the 100/100 plateau; incremental scorecard + era14 prompt input sufficient until Era 15 delivery theme (e.g. SSO R2) or major commercial shift.",
} as const;
