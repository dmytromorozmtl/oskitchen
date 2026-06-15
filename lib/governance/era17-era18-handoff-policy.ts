/**
 * Era 17 → Era 18 handoff input — Evolution Era 17 Workstream L Cycle 45.
 *
 * Documents Era 17 closure facts and Era 18 strategic theme.
 * Does NOT claim Era 17 success criteria met or production enterprise delivery.
 */

import { ERA17_BLENDED_OVERALL, ERA17_SCORECARD_POLICY_ID } from "@/lib/governance/era17-scorecard-policy";

export const ERA17_ERA18_HANDOFF_POLICY_ID = "era17-era18-handoff-input-v1" as const;

export const ERA17_ERA18_HANDOFF_DECISION_DATE = "2026-05-28" as const;

export const ERA17_ERA18_HANDOFF_EXTENDS_POLICIES = [
  ERA17_SCORECARD_POLICY_ID,
  "era7-marketing-claims-governance-v1",
] as const;

export const ERA17_ERA18_HANDOFF_DOC =
  "docs/next-master-prompt-input-2026-05-28-era18.md" as const;

export const ERA17_ERA18_HANDOFF_SCORECARD_DOC =
  "docs/era17-cycle-completion-scorecard-2026-05-28.md" as const;

export const ERA17_ERA18_HANDOFF_EXECUTION_MAP_DOC =
  "docs/era17-strategic-execution-map-2026-05-28.md" as const;

export const ERA17_ERA18_HANDOFF_ERA17_PROMPT_DOC =
  "docs/next-master-prompt-input-2026-05-28-era17.md" as const;

export const ERA17_ERA18_HANDOFF_STRATEGIC_REAUDIT_DOC =
  "docs/full-strategic-reaudit-2026-05-28-era16.md" as const;

/** Era 17 delivery map cycles 1–45 policy-complete; P0 ops proof still operator-blocked. */
export const ERA17_ERA18_HANDOFF_ERA17_STATUS = "era17_complete_awaiting_p0_ops_proof" as const;

export const ERA17_ERA18_HANDOFF_ERA18_THEME =
  "staging_proof_and_first_paid_pilot" as const;

export const ERA17_ERA18_HANDOFF_REQUIRED_SECTIONS = [
  "Era 17 outcomes",
  "Era 17 success criteria",
  "Open P0 for Era 18",
  "Era 18 strategic theme",
  "Re-audit decision",
  "Scorecard (Era 17 end)",
  "Recommended Era 18 master prompt theme",
] as const;

export const ERA17_ERA18_HANDOFF_P0_CARRY_FORWARD = [
  "SSO IdP staging login proof → pilot_ready gate",
  "GitHub staging workflows first-green PASS",
  "Woo/Shopify live smoke PASS on staging",
  "First paid pilot GO/NO-GO → contract → execution",
  "Forbidden-claims enforcement before pilot sales",
] as const;

export const ERA17_ERA18_HANDOFF_SUCCESS_CRITERIA_MET = false as const;

export const ERA17_ERA18_HANDOFF_BLENDED_SCORE = ERA17_BLENDED_OVERALL.era17End;

export const ERA17_ERA18_HANDOFF_GOVERNANCE_SCORE = 100 as const;

export const ERA17_ERA18_HANDOFF_REAUDIT_DECISION = {
  fullReauditRequiredAtEra18Start: false,
  triggerFullReauditWhen: [
    "first paid pilot completes with signed contract",
    "SSO reaches pilot_ready with IdP staging artifact",
    "repo scale shifts materially (>50 new API routes or major auth rewrite)",
  ] as const,
  rationale:
    "Era 16 re-audit remains strategic baseline; Era 17 scorecard captures incremental delivery. Full re-audit at Era 18 boundary only if commercial posture shifts.",
} as const;

export const ERA17_ERA18_HANDOFF_FORBIDDEN_ERA18_CLAIMS = [
  "era 17 success criteria met",
  "production sso or soc2 type ii",
  "paid pilot customer without signed artifact",
  "staging github pass without run url",
  "live woo shopify without smoke pass",
  "governance 100 equals commercial pilot ready",
] as const;

export const ERA17_ERA18_HANDOFF_CI_SCRIPTS = [
  "test:ci:era17-era18-handoff",
  "test:ci:era17-era18-handoff:cert",
] as const;

export const ERA17_ERA18_HANDOFF_UNIT_TESTS = [
  "tests/unit/era17-era18-handoff-policy.test.ts",
  "tests/unit/era17-era18-handoff-cert-live.test.ts",
] as const;

export const ERA17_ERA18_HANDOFF_CANONICAL_DOC_PATHS = [
  ERA17_ERA18_HANDOFF_DOC,
  ERA17_ERA18_HANDOFF_SCORECARD_DOC,
  ERA17_ERA18_HANDOFF_EXECUTION_MAP_DOC,
  ERA17_ERA18_HANDOFF_ERA17_PROMPT_DOC,
  "docs/canonical-doc-index.md",
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
] as const;

export const ERA17_ERA18_HANDOFF_REVIEW_SECTION =
  "Era 17 → Era 18 handoff input (2026-05-28)" as const;

export const ERA17_ERA18_HANDOFF_BACKLOG_ID = "KOS-E17-038" as const;
