/**
 * Evolution Era 12 scorecard policy — Cycle 5 refresh.
 *
 * Closes Era 12 integration hardening + staging E2E cycles 1–4 from era11 handoff.
 */

export const ERA12_SCORECARD_POLICY_ID = "era12-scorecard-refresh-v1" as const;

export const ERA12_EXECUTION_MAP_STATUS = "completed" as const;

export type Era12CycleRecord = {
  cycle: number;
  title: string;
  policyId: string;
  backlogId: string;
};

export const ERA12_COMPLETED_CYCLES: readonly Era12CycleRecord[] = [
  {
    cycle: 1,
    title: "Channel golden path recert",
    policyId: "era12-channel-golden-path-recert-v1",
    backlogId: "KOS-E12-001",
  },
  {
    cycle: 2,
    title: "E2E staging secrets alignment",
    policyId: "era12-e2e-staging-secrets-align-v1",
    backlogId: "KOS-E12-002",
  },
  {
    cycle: 3,
    title: "Channel staging smoke policy",
    policyId: "era12-channel-golden-path-smoke-v1",
    backlogId: "KOS-E12-003",
  },
  {
    cycle: 4,
    title: "E2E staging auth wiring",
    policyId: "era12-e2e-staging-auth-wiring-v1",
    backlogId: "KOS-E12-004",
  },
] as const;

/** Baseline = Era 11 end (canonical index). */
export const ERA12_SCORECARD_ROWS = [
  { area: "Overall", era11End: 98, era12End: 99, delta: 1 },
  { area: "Security", era11End: 82, era12End: 82, delta: 0 },
  { area: "QA", era11End: 90, era12End: 91, delta: 1 },
  { area: "DevOps", era11End: 96, era12End: 97, delta: 1 },
  { area: "RBAC", era11End: 89, era12End: 89, delta: 0 },
  { area: "Inventory", era11End: 72, era12End: 72, delta: 0 },
  { area: "POS", era11End: 74, era12End: 74, delta: 0 },
  { area: "Integrations", era11End: 58, era12End: 59, delta: 1 },
  { area: "KDS", era11End: 72, era12End: 72, delta: 0 },
  { area: "Enterprise readiness", era11End: 65, era12End: 65, delta: 0 },
  { area: "Marketing/sales", era11End: 82, era12End: 82, delta: 0 },
  { area: "Storefront", era11End: 83, era12End: 83, delta: 0 },
] as const;

export const ERA12_SCORECARD_DOCS = {
  scorecard: "docs/era12-cycle-completion-scorecard-2026-05-27.md",
  nextPromptInput: "docs/next-master-prompt-input-2026-05-27-era12.md",
  canonicalIndex: "docs/canonical-doc-index.md",
  era11Scorecard: "docs/era11-cycle-completion-scorecard-2026-05-27.md",
  era11PromptInput: "docs/next-master-prompt-input-2026-05-27-era11.md",
  strategicReaudit: "docs/full-strategic-reaudit-2026-05-27-era2.md",
} as const;

export const ERA12_GOVERNANCE_CERT_CHAIN_ANCHORS = [
  "test:ci:channel-golden-path:cert",
  "test:ci:e2e-staging-secrets-era12:cert",
  "test:ci:e2e-staging-auth-era12:cert",
] as const;

export const ERA12_ADDITIONAL_CERT_EVIDENCE = [
  "tests/unit/channel-golden-path-era12-cert-live.test.ts",
  "tests/unit/channel-golden-path-smoke-era12-cert-live.test.ts",
  "tests/unit/e2e-staging-secrets-era12-cert-live.test.ts",
  "tests/unit/e2e-staging-auth-era12-cert-live.test.ts",
] as const;

export const ERA12_REAUDIT_DECISION = {
  fullReauditRequiredNow: false,
  rationale:
    "Era 12 closed four integration/staging E2E cycles from era11 handoff; incremental scorecard + era12 prompt input sufficient until Era 13 theme or major commercial shift.",
} as const;
