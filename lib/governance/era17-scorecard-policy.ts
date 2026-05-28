/**
 * Evolution Era 17 scorecard policy — Cycle 44 refresh.
 *
 * Evidence-based scores — governance plateau does not imply commercial proof or feature parity.
 */

import { ERA16_SCORECARD_POLICY_ID } from "@/lib/governance/era16-scorecard-policy";

export const ERA17_SCORECARD_POLICY_ID = "era17-scorecard-refresh-v1" as const;

export const ERA17_EXECUTION_MAP_STATUS = "cycles_1_43_delivery_complete_awaiting_p0_proof" as const;

export type Era17CycleRecord = {
  cycle: number;
  title: string;
  policyId: string;
  backlogId: string;
};

/** Twelve representative Era 17 delivery cycles (policy-complete; proof may still be SKIPPED). */
export const ERA17_COMPLETED_CYCLES: readonly Era17CycleRecord[] = [
  {
    cycle: 1,
    title: "SSO IdP staging smoke plan",
    policyId: "era17-enterprise-sso-idp-staging-smoke-v1",
    backlogId: "KOS-E17-001",
  },
  {
    cycle: 2,
    title: "SSO IdP login proof path (honest skip)",
    policyId: "era17-enterprise-sso-idp-login-proof-v1",
    backlogId: "KOS-E17-002",
  },
  {
    cycle: 5,
    title: "Pilot GO/NO-GO + forbidden claims",
    policyId: "era17-pilot-gono-go-v1",
    backlogId: "KOS-E17-011",
  },
  {
    cycle: 6,
    title: "Forbidden-claims enforcement gate",
    policyId: "era17-pilot-forbidden-claims-enforcement-v1",
    backlogId: "KOS-E17-014",
  },
  {
    cycle: 7,
    title: "Webhook replay P1 expansion",
    policyId: "era17-webhook-replay-p1-expansion-v1",
    backlogId: "KOS-E17-018",
  },
  {
    cycle: 8,
    title: "Public API per-route scope enforcement",
    policyId: "era17-public-api-per-route-scope-v1",
    backlogId: "KOS-E17-019",
  },
  {
    cycle: 9,
    title: "POS tablet UX + operator runbook",
    policyId: "era17-pos-tablet-ux-v1",
    backlogId: "KOS-E17-020",
  },
  {
    cycle: 10,
    title: "Channel pilot playbook + setup wizard",
    policyId: "era17-channel-pilot-playbook-v1",
    backlogId: "KOS-E17-007",
  },
  {
    cycle: 11,
    title: "Pilot commercial templates (ICP, golden path, metrics)",
    policyId: "era17-pilot-icp-contract-v1",
    backlogId: "KOS-E17-008",
  },
  {
    cycle: 12,
    title: "GTM proof pack (investor, competitor, case study)",
    policyId: "era17-investor-narrative-onepager-v2-v1",
    backlogId: "KOS-E17-034",
  },
  {
    cycle: 13,
    title: "UX / operator speed (nav, permission denied, wizard)",
    policyId: "era17-nav-maturity-sweep-v1",
    backlogId: "KOS-E17-031",
  },
  {
    cycle: 14,
    title: "Inventory + costing pilot honesty",
    policyId: "era17-pilot-inventory-messaging-v1",
    backlogId: "KOS-E17-029",
  },
] as const;

/** Baseline = Era 16 end (canonical index). */
export const ERA17_SCORECARD_ROWS = [
  { area: "Overall", era16End: 100, era17End: 100, delta: 0 },
  { area: "Security", era16End: 85, era17End: 87, delta: 2 },
  { area: "QA", era16End: 96, era17End: 97, delta: 1 },
  { area: "DevOps", era16End: 100, era17End: 100, delta: 0 },
  { area: "RBAC", era16End: 91, era17End: 92, delta: 1 },
  { area: "Inventory", era16End: 72, era17End: 73, delta: 1 },
  { area: "POS", era16End: 74, era17End: 76, delta: 2 },
  { area: "Integrations", era16End: 62, era17End: 63, delta: 1 },
  { area: "KDS", era16End: 75, era17End: 76, delta: 1 },
  { area: "Enterprise readiness", era16End: 72, era17End: 73, delta: 1 },
  { area: "Marketing/sales", era16End: 85, era17End: 88, delta: 3 },
  { area: "Storefront", era16End: 83, era17End: 83, delta: 0 },
] as const;

/** Blended product/commercial realism — not governance plateau. */
export const ERA17_BLENDED_OVERALL = {
  era16End: 87,
  era17End: 89,
  delta: 2,
} as const;

export const ERA17_SCORECARD_DOCS = {
  scorecard: "docs/era17-cycle-completion-scorecard-2026-05-28.md",
  nextPromptInput: "docs/next-master-prompt-input-2026-05-28-era17.md",
  executionMap: "docs/era17-strategic-execution-map-2026-05-28.md",
  canonicalIndex: "docs/canonical-doc-index.md",
  era16Scorecard: "docs/era16-cycle-completion-scorecard-2026-05-28.md",
  strategicReaudit: "docs/full-strategic-reaudit-2026-05-28-era16.md",
} as const;

export const ERA17_GOVERNANCE_CERT_CHAIN_ANCHORS = [
  "test:ci:enterprise-sso-idp-staging-era17:cert",
  "test:ci:pilot-gono-go-era17:cert",
  "test:ci:pilot-forbidden-claims-enforcement-era17:cert",
  "test:ci:webhook-replay-p1-expansion-era17:cert",
  "test:ci:public-api-per-route-scope-era17:cert",
  "test:ci:competitor-feature-gap-matrix-era17:cert",
] as const;

export const ERA17_SMOKE_SCRIPTS = [
  "smoke:enterprise-sso-idp-staging",
  "smoke:staging-workflows-first-green",
  "smoke:woo-shopify-live",
  "smoke:pilot-gono-go",
  "smoke:pilot-forbidden-claims-enforcement",
  "smoke:pilot-metrics-baseline",
  "smoke:competitor-feature-gap-matrix",
  "smoke:pilot-case-study-draft",
] as const;

export const ERA17_P0_PROOF_STILL_BLOCKED = [
  "SSO IdP staging login — loginProofStatus SKIPPED (6 env vars)",
  "GitHub staging workflows first green — awaiting_github_first_green",
  "Woo/Shopify live smoke — awaiting_live_credentials",
  "Paid pilot customer — GO/NO-GO NO-GO locally",
  "Pilot metrics baseline — overall SKIPPED",
] as const;

export const ERA17_SUCCESS_CRITERIA = {
  allMet: false,
  unmet: [
    "No paid pilot with signed contract",
    "SSO remains pilot_foundation — not pilot_ready",
    "Staging GitHub workflows lack recorded PASS",
    "Woo/Shopify live smoke overall SKIPPED",
  ] as const,
} as const;

export const ERA17_REAUDIT_DECISION = {
  fullReauditRequiredNow: false,
  rationale:
    "Era 16 re-audit remains strategic baseline; Era 17 scorecard captures delivery + honest P0 proof gaps without inflating blended score.",
} as const;

export const ERA17_NEXT_ERA_DECISION = {
  recommendEra18Handoff: true,
  continueEra17OptionalOps: ERA17_P0_PROOF_STILL_BLOCKED,
  rationale:
    "Era 17 delivery map cycles 1–43 are policy-complete; Era 18 should prioritize P0 staging proof, first paid pilot, and full re-audit if commercial posture shifts.",
} as const;

export const ERA17_HONEST_NON_DELIVERIES = [
  "production SSO / SAML for all tenants",
  "SOC2 Type II certification",
  "SCIM provisioning",
  "unified cross-channel inventory depletion",
  "unified rewards ledger",
  "rush-hour KDS certification",
  "live DoorDash/Uber/Grubhub marketplace integrations",
  "Public API production SLA",
  "published customer case study without approval",
] as const;

export const ERA17_EXTENDS_POLICIES = [ERA16_SCORECARD_POLICY_ID] as const;

export const ERA17_BACKLOG_ID = "KOS-E17-037" as const;
