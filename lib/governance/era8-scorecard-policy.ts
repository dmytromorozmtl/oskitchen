/**
 * Evolution Era 8 scorecard policy — Cycle 5 refresh.
 *
 * Closes Era 8 operator-depth / GTM hygiene cycles 1–4 from era7 prompt handoff.
 */

export const ERA8_SCORECARD_POLICY_ID = "era8-scorecard-refresh-v1" as const;

export const ERA8_EXECUTION_MAP_STATUS = "completed" as const;

export type Era8CycleRecord = {
  cycle: number;
  title: string;
  policyId: string;
  backlogId: string;
};

export const ERA8_COMPLETED_CYCLES: readonly Era8CycleRecord[] = [
  {
    cycle: 1,
    title: "Claims registry governance",
    policyId: "era8-claims-registry-v1",
    backlogId: "KOS-E8-001",
  },
  {
    cycle: 2,
    title: "KDS Realtime E2E staging scope",
    policyId: "era8-kds-realtime-e2e-staging-v1",
    backlogId: "KOS-E8-002",
  },
  {
    cycle: 3,
    title: "Pilot preflight strict marketing claims",
    policyId: "era8-pilot-preflight-claims-strict-v1",
    backlogId: "KOS-E8-003",
  },
  {
    cycle: 4,
    title: "Production calendar move-task UI",
    policyId: "era8-production-calendar-move-ui-v1",
    backlogId: "KOS-E8-004",
  },
] as const;

/** Baseline = Era 7 end (canonical index). */
export const ERA8_SCORECARD_ROWS = [
  { area: "Overall", era7End: 92, era8End: 94, delta: 2 },
  { area: "Security", era7End: 81, era8End: 81, delta: 0 },
  { area: "QA", era7End: 87, era8End: 88, delta: 1 },
  { area: "DevOps", era7End: 92, era8End: 93, delta: 1 },
  { area: "RBAC", era7End: 86, era8End: 87, delta: 1 },
  { area: "Inventory", era7End: 72, era8End: 72, delta: 0 },
  { area: "POS", era7End: 74, era8End: 74, delta: 0 },
  { area: "Integrations", era7End: 58, era8End: 58, delta: 0 },
  { area: "KDS", era7End: 67, era8End: 68, delta: 1 },
  { area: "Enterprise readiness", era7End: 62, era8End: 62, delta: 0 },
  { area: "Marketing/sales", era7End: 79, era8End: 81, delta: 2 },
  { area: "Storefront", era7End: 83, era8End: 83, delta: 0 },
] as const;

export const ERA8_SCORECARD_DOCS = {
  scorecard: "docs/era8-cycle-completion-scorecard-2026-05-27.md",
  nextPromptInput: "docs/next-master-prompt-input-2026-05-27-era8.md",
  canonicalIndex: "docs/canonical-doc-index.md",
  era7Scorecard: "docs/era7-cycle-completion-scorecard-2026-05-27.md",
  era7PromptInput: "docs/next-master-prompt-input-2026-05-27-era7.md",
  strategicReaudit: "docs/full-strategic-reaudit-2026-05-27-era2.md",
} as const;

/** Era 8 additions to governance `:cert` chain (full list = era7 + these). */
export const ERA8_GOVERNANCE_CERT_ADDITIONS = [
  "test:ci:claims-registry:cert",
  "test:ci:kds-realtime-e2e-staging:cert",
  "test:ci:pilot-preflight-claims:cert",
  "test:ci:production-calendar-move-ui:cert",
] as const;

export const ERA8_ADDITIONAL_CERT_EVIDENCE = [
  "tests/unit/claims-registry-ci-live.test.ts",
  "tests/unit/kds-realtime-e2e-staging-ci-live.test.ts",
  "tests/unit/pilot-preflight-claims-ci-live.test.ts",
  "tests/unit/production-calendar-move-ui-ci-live.test.ts",
] as const;

export const ERA8_REAUDIT_DECISION = {
  fullReauditRequiredNow: false,
  rationale:
    "Era 8 closed four operator-depth / GTM hygiene cycles from era7 handoff; incremental scorecard + era8 prompt input sufficient until Era 9 theme or major commercial shift.",
} as const;
