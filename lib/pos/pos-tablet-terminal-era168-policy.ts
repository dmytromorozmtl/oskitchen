/**
 * Era 168 — Tablet POS wiring cert (Phase 2 Round 2 #20).
 *
 * Full path: 44px touch targets → portrait/landscape layout → PWA manifest.
 */

import {
  POS_TABLET_TERMINAL_ERA93_MIN_TOUCH_PX,
  POS_TABLET_TERMINAL_ERA93_OPS_DOC,
  POS_TABLET_TERMINAL_ERA93_POLICY_ID,
  POS_TABLET_TERMINAL_ERA93_ROUTE,
  POS_TABLET_TERMINAL_ERA93_SUMMARY_ARTIFACT,
  POS_TABLET_TERMINAL_ERA93_WIRING_PATHS,
} from "@/lib/pos/pos-tablet-terminal-era93-policy";

export const POS_TABLET_TERMINAL_ERA168_POLICY_ID = "era168-pos-tablet-terminal-v1" as const;

export const POS_TABLET_TERMINAL_ERA168_SUMMARY_ARTIFACT =
  "artifacts/pos-tablet-terminal-era168-smoke-summary.json" as const;

export const POS_TABLET_TERMINAL_ERA168_NPM_SCRIPT = "smoke:pos-tablet-terminal-era168" as const;

export const POS_TABLET_TERMINAL_ERA168_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-tablet-terminal-era168.ts" as const;

export const POS_TABLET_TERMINAL_ERA168_OPS_DOC = "docs/pos-tablet-terminal-era168-setup.md" as const;

export const POS_TABLET_TERMINAL_ERA168_CANONICAL_OPS_DOC = POS_TABLET_TERMINAL_ERA93_OPS_DOC;

export const POS_TABLET_TERMINAL_ERA168_CANONICAL_SUMMARY_ARTIFACT =
  POS_TABLET_TERMINAL_ERA93_SUMMARY_ARTIFACT;

export const POS_TABLET_TERMINAL_ERA168_WIRING_PATHS = POS_TABLET_TERMINAL_ERA93_WIRING_PATHS;

export const POS_TABLET_TERMINAL_ERA168_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → POS → Tablet on iPad or Android (768px+ width).",
  "Rotate device — verify portrait/landscape badge and cart panel reflow.",
  "Add to Home Screen via manifest — standalone Tablet POS PWA.",
  "Run npm run smoke:pos-tablet-terminal-era93 — canonical era93 wiring cert PASSED.",
  "Run npm run smoke:pos-tablet-terminal-era168 — artifact overall PASSED.",
] as const;

export const POS_TABLET_TERMINAL_ERA168_CI_SCRIPTS = [
  "test:ci:pos-tablet-terminal-era168",
  "test:ci:pos-tablet-terminal-era168:cert",
] as const;

export const POS_TABLET_TERMINAL_ERA168_UNIT_TESTS = [
  "tests/unit/pos-tablet-terminal-era168.test.ts",
  "tests/unit/pos-tablet-terminal-era93.test.ts",
  "tests/unit/pos-tablet-pos.test.ts",
] as const;

export const POS_TABLET_TERMINAL_ERA168_CANONICAL_POLICY_ID = POS_TABLET_TERMINAL_ERA93_POLICY_ID;

export const POS_TABLET_TERMINAL_ERA168_ROUTE = POS_TABLET_TERMINAL_ERA93_ROUTE;

export const POS_TABLET_TERMINAL_ERA168_MIN_TOUCH_PX = POS_TABLET_TERMINAL_ERA93_MIN_TOUCH_PX;

export const POS_TABLET_TERMINAL_ERA168_CAPABILITIES = [
  "touch_targets_44px",
  "portrait_landscape",
  "pwa_standalone",
] as const;
