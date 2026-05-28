/**
 * Evolution Era 9 scorecard policy — Cycle 5 refresh.
 *
 * Closes Era 9 enterprise delivery / DevOps / security recert cycles 1–4 from era8 handoff.
 */

export const ERA9_SCORECARD_POLICY_ID = "era9-scorecard-refresh-v1" as const;

export const ERA9_EXECUTION_MAP_STATUS = "completed" as const;

export type Era9CycleRecord = {
  cycle: number;
  title: string;
  policyId: string;
  backlogId: string;
};

export const ERA9_COMPLETED_CYCLES: readonly Era9CycleRecord[] = [
  {
    cycle: 1,
    title: "Enterprise SSO architecture spike (R1)",
    policyId: "era9-enterprise-sso-architecture-spike-v1",
    backlogId: "KOS-E9-001",
  },
  {
    cycle: 2,
    title: "Governance bundles partition",
    policyId: "era9-governance-bundles-partition-v1",
    backlogId: "KOS-E9-002",
  },
  {
    cycle: 3,
    title: "Cron surface recert",
    policyId: "era9-cron-surface-recert-v1",
    backlogId: "KOS-E9-003",
  },
  {
    cycle: 4,
    title: "RBAC wave 4 recert",
    policyId: "era9-rbac-wave4-recert-v1",
    backlogId: "KOS-E9-004",
  },
] as const;

/** Baseline = Era 8 end (canonical index). */
export const ERA9_SCORECARD_ROWS = [
  { area: "Overall", era8End: 94, era9End: 96, delta: 2 },
  { area: "Security", era8End: 81, era9End: 82, delta: 1 },
  { area: "QA", era8End: 88, era9End: 88, delta: 0 },
  { area: "DevOps", era8End: 93, era9End: 95, delta: 2 },
  { area: "RBAC", era8End: 87, era9End: 88, delta: 1 },
  { area: "Inventory", era8End: 72, era9End: 72, delta: 0 },
  { area: "POS", era8End: 74, era9End: 74, delta: 0 },
  { area: "Integrations", era8End: 58, era9End: 58, delta: 0 },
  { area: "KDS", era8End: 68, era9End: 68, delta: 0 },
  { area: "Enterprise readiness", era8End: 62, era9End: 65, delta: 3 },
  { area: "Marketing/sales", era8End: 81, era9End: 81, delta: 0 },
  { area: "Storefront", era8End: 83, era9End: 83, delta: 0 },
] as const;

export const ERA9_SCORECARD_DOCS = {
  scorecard: "docs/era9-cycle-completion-scorecard-2026-05-27.md",
  nextPromptInput: "docs/next-master-prompt-input-2026-05-27-era9.md",
  canonicalIndex: "docs/canonical-doc-index.md",
  era8Scorecard: "docs/era8-cycle-completion-scorecard-2026-05-27.md",
  era8PromptInput: "docs/next-master-prompt-input-2026-05-27-era8.md",
  strategicReaudit: "docs/full-strategic-reaudit-2026-05-27-era2.md",
} as const;

/** Era 9 additions to governance `:cert` chain (full list = era8 + these). */
export const ERA9_GOVERNANCE_CERT_ADDITIONS = ["test:ci:enterprise-sso-spike:cert"] as const;

/** Partition wiring cert (chained via `test:ci:typecheck-slice:cert` on partition-platform). */
export const ERA9_GOVERNANCE_PARTITION_CERT = "test:ci:governance-bundles-partition:cert" as const;

export const ERA9_RECERT_CERT_EXTENSIONS = [
  "test:ci:cron-hygiene:cert",
  "test:ci:rbac-wave4:cert",
] as const;

export const ERA9_ADDITIONAL_CERT_EVIDENCE = [
  "tests/unit/enterprise-sso-architecture-spike-ci-live.test.ts",
  "tests/unit/governance-bundles-partition-ci-live.test.ts",
  "tests/unit/cron-surface-era9-cert-live.test.ts",
  "tests/unit/rbac-wave4-era9-cert-live.test.ts",
] as const;

export const ERA9_REAUDIT_DECISION = {
  fullReauditRequiredNow: false,
  rationale:
    "Era 9 closed four enterprise/DevOps/security recert cycles from era8 handoff; incremental scorecard + era9 prompt input sufficient until Era 10 theme or major commercial shift.",
} as const;
