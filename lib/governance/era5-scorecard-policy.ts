/**
 * Evolution Era 5 scorecard policy — Cycle 6 refresh.
 *
 * Closes Era 5 P0 handoff from era4 prompt input (E5-1 … E5-5).
 */

export const ERA5_SCORECARD_POLICY_ID = "era5-scorecard-refresh-v1" as const;

export const ERA5_EXECUTION_MAP_STATUS = "completed" as const;

export type Era5CycleRecord = {
  cycle: number;
  title: string;
  policyId: string;
  backlogId: string;
};

export const ERA5_COMPLETED_CYCLES: readonly Era5CycleRecord[] = [
  {
    cycle: 1,
    title: "RBAC wave 4 in security-db bundle",
    policyId: "rbac-wave4-security-bundle-v1",
    backlogId: "KOS-E5-001",
  },
  {
    cycle: 2,
    title: "Typecheck slice 2 (storefront/marketing)",
    policyId: "era5-typecheck-slice-v2",
    backlogId: "KOS-E5-002",
  },
  {
    cycle: 3,
    title: "Permanent POS-only inventory GTM lock",
    policyId: "era5-pos-only-gtm-lock-v1",
    backlogId: "KOS-E5-003",
  },
  {
    cycle: 4,
    title: "Copilot void-form deny UX",
    policyId: "era5-copilot-form-deny-v1",
    backlogId: "KOS-E5-004",
  },
  {
    cycle: 5,
    title: "POS browser E2E secrets policy closure",
    policyId: "era5-pos-e2e-secrets-accept-v1",
    backlogId: "KOS-E5-005",
  },
] as const;

/** Baseline = Era 4 end (canonical index). */
export const ERA5_SCORECARD_ROWS = [
  { area: "Overall", era4End: 82, era5End: 86, delta: 4 },
  { area: "Security", era4End: 74, era5End: 78, delta: 4 },
  { area: "QA", era4End: 82, era5End: 84, delta: 2 },
  { area: "DevOps", era4End: 85, era5End: 88, delta: 3 },
  { area: "RBAC", era4End: 80, era5End: 83, delta: 3 },
  { area: "Inventory", era4End: 68, era5End: 72, delta: 4 },
  { area: "POS", era4End: 70, era5End: 74, delta: 4 },
  { area: "Integrations", era4End: 58, era5End: 58, delta: 0 },
  { area: "KDS", era4End: 64, era5End: 64, delta: 0 },
  { area: "Enterprise readiness", era4End: 55, era5End: 55, delta: 0 },
  { area: "Marketing/sales", era4End: 70, era5End: 71, delta: 1 },
  { area: "Storefront", era4End: 79, era5End: 80, delta: 1 },
] as const;

export const ERA5_SCORECARD_DOCS = {
  scorecard: "docs/era5-cycle-completion-scorecard-2026-05-27.md",
  nextPromptInput: "docs/next-master-prompt-input-2026-05-27-era5.md",
  canonicalIndex: "docs/canonical-doc-index.md",
  era4Scorecard: "docs/era4-cycle-completion-scorecard-2026-05-27.md",
  era4PromptInput: "docs/next-master-prompt-input-2026-05-27-era4.md",
  strategicReaudit: "docs/full-strategic-reaudit-2026-05-27-era2.md",
} as const;

/** Governance `:cert` gates unchanged count from Era 4; Era 5 extended unit bundles. */
export const ERA5_GOVERNANCE_CERT_SCRIPTS = [
  "test:ci:doc-canon:cert",
  "test:ci:public-api-v1:cert",
  "test:ci:nav-governance:cert",
  "test:ci:integration-honesty:cert",
  "test:ci:channel-golden-path:cert",
  "test:ci:typecheck-slice:cert",
  "test:ci:enterprise-procurement:cert",
  "test:ci:cross-channel-rewards:cert",
  "test:ci:storefront-money-path:cert",
  "test:ci:pos-money-path:cert",
  "test:ci:inventory-depletion:cert",
  "test:ci:cron-hygiene:cert",
  "test:ci:kds-v1:cert",
  "test:ci:kds-v1:prototype:cert",
  "test:ci:kds-staging-smoke:cert",
  "test:ci:mutation-access-consolidation:cert",
  "test:ci:page-maturity-sweep:cert",
  "test:ci:scorecard:cert",
] as const;

export const ERA5_ADDITIONAL_CERT_EVIDENCE = [
  "test:ci:rbac-wave4 (chained in test:security)",
  "tests/unit/pos-e2e-secrets-policy-cert-live.test.ts",
  "tests/unit/inventory-depletion-gtm-lock-cert-live.test.ts",
  "tests/unit/copilot-form-deny-ci-live.test.ts",
] as const;

export const ERA5_REAUDIT_DECISION = {
  fullReauditRequiredNow: false,
  rationale:
    "Era 5 closed all five P0 items from era4 prompt input with policy IDs and CI wiring; incremental scorecard + era5 prompt input sufficient until Era 6 theme or major commercial shift.",
} as const;
