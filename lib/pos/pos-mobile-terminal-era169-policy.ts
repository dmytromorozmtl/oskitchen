/**
 * Era 169 — Mobile POS wiring cert (Phase 2 Round 2 #21).
 *
 * Full path: swipe-to-add → one-hand checkout → phone PWA manifest.
 */

import {
  POS_MOBILE_TERMINAL_ERA94_MIN_TOUCH_PX,
  POS_MOBILE_TERMINAL_ERA94_OPS_DOC,
  POS_MOBILE_TERMINAL_ERA94_POLICY_ID,
  POS_MOBILE_TERMINAL_ERA94_ROUTE,
  POS_MOBILE_TERMINAL_ERA94_SUMMARY_ARTIFACT,
  POS_MOBILE_TERMINAL_ERA94_WIRING_PATHS,
} from "@/lib/pos/pos-mobile-terminal-era94-policy";

export const POS_MOBILE_TERMINAL_ERA169_POLICY_ID = "era169-pos-mobile-terminal-v1" as const;

export const POS_MOBILE_TERMINAL_ERA169_SUMMARY_ARTIFACT =
  "artifacts/pos-mobile-terminal-era169-smoke-summary.json" as const;

export const POS_MOBILE_TERMINAL_ERA169_NPM_SCRIPT = "smoke:pos-mobile-terminal-era169" as const;

export const POS_MOBILE_TERMINAL_ERA169_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-mobile-terminal-era169.ts" as const;

export const POS_MOBILE_TERMINAL_ERA169_OPS_DOC = "docs/pos-mobile-terminal-era169-setup.md" as const;

export const POS_MOBILE_TERMINAL_ERA169_CANONICAL_OPS_DOC = POS_MOBILE_TERMINAL_ERA94_OPS_DOC;

export const POS_MOBILE_TERMINAL_ERA169_CANONICAL_SUMMARY_ARTIFACT =
  POS_MOBILE_TERMINAL_ERA94_SUMMARY_ARTIFACT;

export const POS_MOBILE_TERMINAL_ERA169_WIRING_PATHS = POS_MOBILE_TERMINAL_ERA94_WIRING_PATHS;

export const POS_MOBILE_TERMINAL_ERA169_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → POS → Mobile on a phone (375px+ width).",
  "Swipe right on a product row — item adds to cart with swipe hint.",
  "Use bottom thumb-zone cash checkout — one-hand complete sale.",
  "Run npm run smoke:pos-mobile-terminal-era94 — canonical era94 wiring cert PASSED.",
  "Run npm run smoke:pos-mobile-terminal-era169 — artifact overall PASSED.",
] as const;

export const POS_MOBILE_TERMINAL_ERA169_CI_SCRIPTS = [
  "test:ci:pos-mobile-terminal-era169",
  "test:ci:pos-mobile-terminal-era169:cert",
] as const;

export const POS_MOBILE_TERMINAL_ERA169_UNIT_TESTS = [
  "tests/unit/pos-mobile-terminal-era169.test.ts",
  "tests/unit/pos-mobile-terminal-era94.test.ts",
  "tests/unit/pos-mobile-pos.test.ts",
] as const;

export const POS_MOBILE_TERMINAL_ERA169_CANONICAL_POLICY_ID = POS_MOBILE_TERMINAL_ERA94_POLICY_ID;

export const POS_MOBILE_TERMINAL_ERA169_ROUTE = POS_MOBILE_TERMINAL_ERA94_ROUTE;

export const POS_MOBILE_TERMINAL_ERA169_MIN_TOUCH_PX = POS_MOBILE_TERMINAL_ERA94_MIN_TOUCH_PX;

export const POS_MOBILE_TERMINAL_ERA169_CAPABILITIES = [
  "swipe_gestures",
  "one_hand_checkout",
  "pwa_standalone",
] as const;
