/**
 * Evolution Era 4 scorecard policy — Cycle 13 refresh.
 *
 * Single source for Era 4 execution map completion, score deltas, and CI doc wiring.
 */

export const ERA4_SCORECARD_POLICY_ID = "era4-scorecard-refresh-v1" as const;

export const ERA4_EXECUTION_MAP_STATUS = "completed" as const;

export type Era4CycleRecord = {
  cycle: number;
  title: string;
  policyId: string;
  backlogId: string;
};

export const ERA4_COMPLETED_CYCLES: readonly Era4CycleRecord[] = [
  { cycle: 1, title: "POS-only inventory depletion policy", policyId: "era4-pos-only-v1", backlogId: "KOS-E4-001" },
  { cycle: 2, title: "POS browser E2E CI policy", policyId: "era4-tier2b-optional-v1", backlogId: "KOS-E4-002" },
  { cycle: 3, title: "RBAC wave 4 batch 1", policyId: "rbac-wave4-batch1", backlogId: "KOS-E4-003" },
  { cycle: 4, title: "Cron experimental archive", policyId: "era4-active-production-only-v1", backlogId: "KOS-E4-004" },
  { cycle: 5, title: "Shopify/Woo golden path", policyId: "era4-channel-golden-path-v1", backlogId: "KOS-E4-005" },
  { cycle: 6, title: "RBAC wave 4 batch 2", policyId: "rbac-wave4-batch2", backlogId: "KOS-E4-006" },
  { cycle: 7, title: "Typecheck slice 1", policyId: "era4-typecheck-slice-v1", backlogId: "KOS-E4-007" },
  { cycle: 8, title: "Enterprise procurement pack", policyId: "era4-procurement-honesty-v1", backlogId: "KOS-E4-008" },
  { cycle: 9, title: "Cross-channel rewards honesty", policyId: "era4-cross-channel-rewards-v1", backlogId: "KOS-E4-009" },
  { cycle: 10, title: "KDS staging smoke", policyId: "era4-kds-staging-smoke-v1", backlogId: "KOS-E4-010" },
  { cycle: 11, title: "Mutation access consolidation", policyId: "era4-mutation-access-consolidation-v1", backlogId: "KOS-E4-011" },
  { cycle: 12, title: "Nav/page maturity sweep", policyId: "era4-page-maturity-sweep-v1", backlogId: "KOS-E4-012" },
] as const;

/** Baseline = Era 3 governance increment (canonical index). */
export const ERA4_SCORECARD_ROWS = [
  { area: "Overall", era3End: 73, era4End: 82, delta: 9 },
  { area: "Security", era3End: 67, era4End: 74, delta: 7 },
  { area: "QA", era3End: 75, era4End: 82, delta: 7 },
  { area: "DevOps", era3End: 78, era4End: 85, delta: 7 },
  { area: "RBAC", era3End: 76, era4End: 80, delta: 4 },
  { area: "Inventory", era3End: 62, era4End: 68, delta: 6 },
  { area: "Integrations", era3End: 51, era4End: 58, delta: 7 },
  { area: "POS", era3End: 64, era4End: 70, delta: 6 },
  { area: "KDS", era3End: 58, era4End: 64, delta: 6 },
  { area: "Enterprise readiness", era3End: 46, era4End: 55, delta: 9 },
  { area: "Marketing/sales", era3End: 63, era4End: 70, delta: 7 },
  { area: "Storefront", era3End: 78, era4End: 79, delta: 1 },
] as const;

export const ERA4_SCORECARD_DOCS = {
  scorecard: "docs/era4-cycle-completion-scorecard-2026-05-27.md",
  nextPromptInput: "docs/next-master-prompt-input-2026-05-27-era4.md",
  canonicalIndex: "docs/canonical-doc-index.md",
  era2Scorecard: "docs/era2-cycle-completion-scorecard-2026-05-27.md",
  strategicReaudit: "docs/full-strategic-reaudit-2026-05-27-era2.md",
} as const;

/** Cert scripts chained in `test:ci:governance-bundles` (Era 4 expanded set). */
export const ERA4_GOVERNANCE_CERT_SCRIPTS = [
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

export const ERA4_REAUDIT_DECISION = {
  fullReauditRequiredNow: false,
  rationale:
    "Era 4 closed all 11 strategic execution-map items with policy IDs and CI certs; incremental scorecard + era4 prompt input sufficient until Era 5 theme or major release.",
} as const;
