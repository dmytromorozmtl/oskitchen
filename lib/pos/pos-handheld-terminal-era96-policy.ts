/**
 * Era 96 — Handheld POS wiring cert (Phase 2 extension #96).
 *
 * Full path: table select → cart build → fire to KDS → tab sync → offline cash checkout.
 */

export const POS_HANDHELD_TERMINAL_ERA96_POLICY_ID = "era96-pos-handheld-terminal-v1" as const;

export const POS_HANDHELD_TERMINAL_ERA96_SUMMARY_ARTIFACT =
  "artifacts/pos-handheld-terminal-smoke-summary.json" as const;

export const POS_HANDHELD_TERMINAL_ERA96_NPM_SCRIPT = "smoke:pos-handheld-terminal-era96" as const;

export const POS_HANDHELD_TERMINAL_ERA96_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-handheld-terminal-era96.ts" as const;

export const POS_HANDHELD_TERMINAL_ERA96_OPS_DOC = "docs/pos-handheld-terminal-era96-setup.md" as const;

export const POS_HANDHELD_TERMINAL_ERA96_WIRING_PATHS = [
  "app/dashboard/pos/handheld/page.tsx",
  "app/dashboard/pos/handheld/manifest.webmanifest/route.ts",
  "components/pos/handheld-ordering-client.tsx",
  "lib/pos/handheld-ordering.ts",
  "actions/pos/handheld.ts",
  "services/pos/handheld-kds-fire-service.ts",
  "services/pos/handheld-ordering-service.ts",
] as const;

export const POS_HANDHELD_TERMINAL_ERA96_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → POS → Handheld on a phone or tablet (375px+ width).",
  "Select a table, add items to cart, tap Fire to KDS — verify kitchen work items created.",
  "Complete cash checkout or queue offline sale — verify tab sync and KDS link.",
  "Run npm run smoke:pos-handheld-terminal-era96 — artifact overall PASSED.",
] as const;

export const POS_HANDHELD_TERMINAL_ERA96_CI_SCRIPTS = [
  "test:ci:pos-handheld-terminal-era96",
  "test:ci:pos-handheld-terminal-era96:cert",
] as const;

export const POS_HANDHELD_TERMINAL_ERA96_UNIT_TESTS = [
  "tests/unit/pos-handheld-terminal-era96.test.ts",
  "tests/unit/handheld-kds-fire.test.ts",
] as const;

export const POS_HANDHELD_TERMINAL_ERA96_ROUTE = "/dashboard/pos/handheld" as const;

export const POS_HANDHELD_TERMINAL_ERA96_KDS_ROUTE = "/dashboard/kitchen" as const;

export const POS_HANDHELD_TERMINAL_ERA96_MIN_TOUCH_PX = 48 as const;
