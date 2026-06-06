/**
 * Era 94 — Mobile POS wiring cert (Phase 2 extension #94).
 *
 * Full path: swipe-to-add → one-hand checkout → phone PWA manifest.
 */

export const POS_MOBILE_TERMINAL_ERA94_POLICY_ID = "era94-pos-mobile-terminal-v1" as const;

export const POS_MOBILE_TERMINAL_ERA94_SUMMARY_ARTIFACT =
  "artifacts/pos-mobile-terminal-smoke-summary.json" as const;

export const POS_MOBILE_TERMINAL_ERA94_NPM_SCRIPT = "smoke:pos-mobile-terminal" as const;

export const POS_MOBILE_TERMINAL_ERA94_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-mobile-terminal-era94.ts" as const;

export const POS_MOBILE_TERMINAL_ERA94_OPS_DOC = "docs/pos-mobile-terminal-era94-setup.md" as const;

export const POS_MOBILE_TERMINAL_ERA94_WIRING_PATHS = [
  "app/dashboard/pos/mobile/page.tsx",
  "app/dashboard/pos/mobile/manifest.webmanifest/route.ts",
  "components/pos/pos-mobile-client.tsx",
  "lib/pos/pos-mobile-pos-policy.ts",
  "lib/pos/pos-mobile-gestures.ts",
  "lib/pos/pos-mobile-cart.ts",
  "lib/pos/touch-targets.ts",
] as const;

export const POS_MOBILE_TERMINAL_ERA94_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → POS → Mobile on a phone (375px+ width).",
  "Swipe right on a product row — item adds to cart with swipe hint.",
  "Use bottom thumb-zone cash checkout — one-hand complete sale.",
  "Run npm run smoke:pos-mobile-terminal-era94 — artifact overall PASSED.",
] as const;

export const POS_MOBILE_TERMINAL_ERA94_CI_SCRIPTS = [
  "test:ci:pos-mobile-terminal-era94",
  "test:ci:pos-mobile-terminal-era94:cert",
] as const;

export const POS_MOBILE_TERMINAL_ERA94_UNIT_TESTS = [
  "tests/unit/pos-mobile-terminal-era94.test.ts",
  "tests/unit/pos-mobile-pos.test.ts",
] as const;

export const POS_MOBILE_TERMINAL_ERA94_ROUTE = "/dashboard/pos/mobile" as const;

export const POS_MOBILE_TERMINAL_ERA94_MIN_TOUCH_PX = 48 as const;
