/**
 * Evolution Era 6 scorecard policy — Cycle 6 refresh.
 *
 * Closes Era 6 P0 handoff from era5 prompt input (E6-1 … E6-5) plus P1 production calendar.
 */

export const ERA6_SCORECARD_POLICY_ID = "era6-scorecard-refresh-v1" as const;

export const ERA6_EXECUTION_MAP_STATUS = "completed" as const;

export type Era6CycleRecord = {
  cycle: number;
  title: string;
  policyId: string;
  backlogId: string;
};

export const ERA6_COMPLETED_CYCLES: readonly Era6CycleRecord[] = [
  {
    cycle: 1,
    title: "Permanent dual-ledger rewards GTM lock",
    policyId: "era6-dual-ledger-gtm-lock-v1",
    backlogId: "KOS-E6-001",
  },
  {
    cycle: 2,
    title: "KDS realtime / poll fallback smoke",
    policyId: "era6-kds-realtime-smoke-v1",
    backlogId: "KOS-E6-002",
  },
  {
    cycle: 3,
    title: "Typecheck slices parallel CI job",
    policyId: "era6-typecheck-slice-ci-v1",
    backlogId: "KOS-E6-003",
  },
  {
    cycle: 4,
    title: "Production calendar void-form deny UX",
    policyId: "era6-production-calendar-form-deny-v1",
    backlogId: "KOS-E6-004",
  },
  {
    cycle: 5,
    title: "Enterprise identity annual review",
    policyId: "era6-enterprise-identity-roadmap-v1",
    backlogId: "KOS-E6-005",
  },
] as const;

/** Baseline = Era 5 end (canonical index). */
export const ERA6_SCORECARD_ROWS = [
  { area: "Overall", era5End: 86, era6End: 90, delta: 4 },
  { area: "Security", era5End: 78, era6End: 81, delta: 3 },
  { area: "QA", era5End: 84, era6End: 86, delta: 2 },
  { area: "DevOps", era5End: 88, era6End: 91, delta: 3 },
  { area: "RBAC", era5End: 83, era6End: 86, delta: 3 },
  { area: "Inventory", era5End: 72, era6End: 72, delta: 0 },
  { area: "POS", era5End: 74, era6End: 74, delta: 0 },
  { area: "Integrations", era5End: 58, era6End: 58, delta: 0 },
  { area: "KDS", era5End: 64, era6End: 67, delta: 3 },
  { area: "Enterprise readiness", era5End: 55, era6End: 62, delta: 7 },
  { area: "Marketing/sales", era5End: 71, era6End: 74, delta: 3 },
  { area: "Storefront", era5End: 80, era6End: 80, delta: 0 },
] as const;

export const ERA6_SCORECARD_DOCS = {
  scorecard: "docs/era6-cycle-completion-scorecard-2026-05-27.md",
  nextPromptInput: "docs/next-master-prompt-input-2026-05-27-era6.md",
  canonicalIndex: "docs/canonical-doc-index.md",
  era5Scorecard: "docs/era5-cycle-completion-scorecard-2026-05-27.md",
  era5PromptInput: "docs/next-master-prompt-input-2026-05-27-era5.md",
  strategicReaudit: "docs/full-strategic-reaudit-2026-05-27-era2.md",
} as const;

/** Governance `:cert` gates in `test:ci:governance-bundles` (scorecard:cert must remain last). */
export const ERA6_GOVERNANCE_CERT_SCRIPTS = [
  "test:ci:doc-canon:cert",
  "test:ci:public-api-v1:cert",
  "test:ci:nav-governance:cert",
  "test:ci:integration-honesty:cert",
  "test:ci:channel-golden-path:cert",
  "test:ci:typecheck-slice:cert",
  "test:ci:enterprise-procurement:cert",
  "test:ci:enterprise-identity-roadmap:cert",
  "test:ci:cross-channel-rewards:cert",
  "test:ci:storefront-money-path:cert",
  "test:ci:pos-money-path:cert",
  "test:ci:inventory-depletion:cert",
  "test:ci:cron-hygiene:cert",
  "test:ci:kds-v1:cert",
  "test:ci:kds-v1:prototype:cert",
  "test:ci:kds-staging-smoke:cert",
  "test:ci:kds-realtime-smoke:cert",
  "test:ci:mutation-access-consolidation:cert",
  "test:ci:page-maturity-sweep:cert",
  "test:ci:scorecard:cert",
] as const;

export const ERA6_ADDITIONAL_CERT_EVIDENCE = [
  "tests/unit/cross-channel-rewards-gtm-lock-cert-live.test.ts",
  "tests/unit/typecheck-slice-ci-parallel-live.test.ts",
  "tests/unit/production-calendar-form-deny-ci-live.test.ts",
  "tests/unit/enterprise-identity-roadmap-ci-live.test.ts",
] as const;

export const ERA6_REAUDIT_DECISION = {
  fullReauditRequiredNow: false,
  rationale:
    "Era 6 closed all five P0 items from era5 prompt input (plus production-calendar P1); incremental scorecard + era6 prompt input sufficient until Era 7 theme or major commercial shift.",
} as const;
