/**
 * POS tablet UX polish — Evolution Era 17 Workstream E Cycle 22 (engineering Cycle 20).
 *
 * Touch targets, checkout status clarity, permission-denied consistency, software-only operator runbook.
 * Does NOT claim hardware POS certification, offline POS, or rush-hour throughput.
 */

import { POS_BROWSER_E2E_POLICY_ID } from "@/lib/ci/pos-browser-e2e-policy";

export const POS_TABLET_UX_ERA17_POLICY_ID = "era17-pos-tablet-ux-v1" as const;

export const POS_TABLET_UX_ERA17_DECISION_DATE = "2026-05-28" as const;

export const POS_TABLET_UX_ERA17_EXTENDS_POLICIES = [POS_BROWSER_E2E_POLICY_ID] as const;

/** Runtime UX + cert proof — not manual tablet sign-off on staging hardware. */
export const POS_TABLET_UX_ERA17_PROOF_STATUS = "tablet_ux_polished" as const;

export const POS_TABLET_UX_ERA17_TERMINAL_MODULE =
  "components/dashboard/pos-terminal-client.tsx" as const;

export const POS_TABLET_UX_ERA17_TOUCH_MODULE = "lib/pos/touch-targets.ts" as const;

export const POS_TABLET_UX_ERA17_STATUS_MODULE = "lib/pos/pos-checkout-status.ts" as const;

export const POS_TABLET_UX_ERA17_OPERATOR_DOC =
  "docs/pos-tablet-ux-operator-runbook-era17.md" as const;

export const POS_TABLET_UX_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-tablet-ux-era17.ts" as const;

export const POS_TABLET_UX_ERA17_SUMMARY_ARTIFACT =
  "artifacts/pos-tablet-ux-summary.json" as const;

export const POS_TABLET_UX_ERA17_NPM_SCRIPT = "smoke:pos-tablet-ux" as const;

export const POS_TABLET_UX_ERA17_UX_TARGETS = [
  "48px primary tap targets on product tiles and complete sale",
  "44px floor on cart quantity controls and tab actions",
  "Distinct success / error / info checkout status styling",
  "PermissionDeniedSurfaceCard for permission denied on terminal and hub",
  "Tap-to-pay errors surfaced in checkout status region",
  "Pending checkout skeleton while submitting",
] as const;

export const POS_TABLET_UX_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Open /dashboard/pos/terminal on a tablet or narrow viewport.",
  "Verify product tiles and Complete sale meet touch target checklist in operator runbook.",
  "Trigger a validation error (empty cart) — confirm destructive status styling.",
  "Complete a cash sale — confirm success status styling.",
  "Run npm run smoke:pos-tablet-ux — review cert chain PASS.",
  "Do not claim hardware POS certification, offline POS, or rush-hour throughput.",
] as const;

export const POS_TABLET_UX_ERA17_CANONICAL_MARKERS = [
  POS_TABLET_UX_ERA17_POLICY_ID,
  "smoke:pos-tablet-ux",
  "tablet_ux_polished",
  "pos-checkout-status",
  "PermissionDeniedSurfaceCard",
] as const;

export const POS_TABLET_UX_ERA17_FORBIDDEN_CLAIMS = [
  "hardware pos certified",
  "offline pos production ready",
  "rush-hour pos throughput certified",
  "toast hardware parity",
  "square terminal parity",
] as const;

export const POS_TABLET_UX_ERA17_CI_SCRIPTS = [
  "test:ci:pos-tablet-ux-era17",
  "test:ci:pos-tablet-ux-era17:cert",
] as const;

export const POS_TABLET_UX_ERA17_UNIT_TESTS = [
  "tests/unit/pos-tablet-ux-era17-policy.test.ts",
  "tests/unit/pos-checkout-status.test.ts",
  "tests/unit/pos-touch-targets.test.ts",
  "tests/unit/pos-tablet-ux-era17-cert-live.test.ts",
] as const;

export const POS_TABLET_UX_ERA17_CANONICAL_DOC_PATHS = [
  POS_TABLET_UX_ERA17_OPERATOR_DOC,
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const POS_TABLET_UX_ERA17_REVIEW_SECTION =
  "Era 17 POS tablet UX polish (2026-05-28)" as const;

export const POS_TABLET_UX_ERA17_BACKLOG_ID = "KOS-E17-020" as const;
