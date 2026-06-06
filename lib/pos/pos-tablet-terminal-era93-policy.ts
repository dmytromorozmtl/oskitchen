/**
 * Era 93 — Tablet POS wiring cert (Phase 2 extension #93).
 *
 * Full path: 44px touch targets → portrait/landscape layout → PWA manifest.
 */

export const POS_TABLET_TERMINAL_ERA93_POLICY_ID = "era93-pos-tablet-terminal-v1" as const;

export const POS_TABLET_TERMINAL_ERA93_SUMMARY_ARTIFACT =
  "artifacts/pos-tablet-terminal-smoke-summary.json" as const;

export const POS_TABLET_TERMINAL_ERA93_NPM_SCRIPT = "smoke:pos-tablet-terminal" as const;

export const POS_TABLET_TERMINAL_ERA93_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-tablet-terminal-era93.ts" as const;

export const POS_TABLET_TERMINAL_ERA93_OPS_DOC = "docs/pos-tablet-terminal-era93-setup.md" as const;

export const POS_TABLET_TERMINAL_ERA93_WIRING_PATHS = [
  "app/dashboard/pos/tablet/page.tsx",
  "app/dashboard/pos/tablet/manifest.webmanifest/route.ts",
  "components/pos/pos-tablet-client.tsx",
  "components/dashboard/pos-terminal-client.tsx",
  "lib/pos/pos-tablet-pos-policy.ts",
  "lib/pos/pos-tablet-layout.ts",
  "lib/pos/touch-targets.ts",
] as const;

export const POS_TABLET_TERMINAL_ERA93_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → POS → Tablet on iPad or Android (768px+ width).",
  "Rotate device — verify portrait/landscape badge and cart panel reflow.",
  "Add to Home Screen via manifest — standalone Tablet POS PWA.",
  "Run npm run smoke:pos-tablet-terminal-era93 — artifact overall PASSED.",
] as const;

export const POS_TABLET_TERMINAL_ERA93_CI_SCRIPTS = [
  "test:ci:pos-tablet-terminal-era93",
  "test:ci:pos-tablet-terminal-era93:cert",
] as const;

export const POS_TABLET_TERMINAL_ERA93_UNIT_TESTS = [
  "tests/unit/pos-tablet-terminal-era93.test.ts",
  "tests/unit/pos-tablet-pos.test.ts",
] as const;

export const POS_TABLET_TERMINAL_ERA93_ROUTE = "/dashboard/pos/tablet" as const;

export const POS_TABLET_TERMINAL_ERA93_MIN_TOUCH_PX = 44 as const;
