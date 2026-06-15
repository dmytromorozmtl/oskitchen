/**
 * Era 171 — Handheld POS wiring cert (Phase 2 Round 2 #23).
 *
 * Full path: table select → cart build → fire to KDS → tab sync → offline cash checkout.
 */

import {
  POS_HANDHELD_TERMINAL_ERA96_KDS_ROUTE,
  POS_HANDHELD_TERMINAL_ERA96_MIN_TOUCH_PX,
  POS_HANDHELD_TERMINAL_ERA96_OPS_DOC,
  POS_HANDHELD_TERMINAL_ERA96_POLICY_ID,
  POS_HANDHELD_TERMINAL_ERA96_ROUTE,
  POS_HANDHELD_TERMINAL_ERA96_SUMMARY_ARTIFACT,
  POS_HANDHELD_TERMINAL_ERA96_WIRING_PATHS,
} from "@/lib/pos/pos-handheld-terminal-era96-policy";

export const POS_HANDHELD_TERMINAL_ERA171_POLICY_ID = "era171-pos-handheld-terminal-v1" as const;

export const POS_HANDHELD_TERMINAL_ERA171_SUMMARY_ARTIFACT =
  "artifacts/pos-handheld-terminal-era171-smoke-summary.json" as const;

export const POS_HANDHELD_TERMINAL_ERA171_NPM_SCRIPT = "smoke:pos-handheld-terminal-era171" as const;

export const POS_HANDHELD_TERMINAL_ERA171_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-handheld-terminal-era171.ts" as const;

export const POS_HANDHELD_TERMINAL_ERA171_OPS_DOC = "docs/pos-handheld-terminal-era171-setup.md" as const;

export const POS_HANDHELD_TERMINAL_ERA171_CANONICAL_OPS_DOC = POS_HANDHELD_TERMINAL_ERA96_OPS_DOC;

export const POS_HANDHELD_TERMINAL_ERA171_CANONICAL_SUMMARY_ARTIFACT =
  POS_HANDHELD_TERMINAL_ERA96_SUMMARY_ARTIFACT;

export const POS_HANDHELD_TERMINAL_ERA171_WIRING_PATHS = POS_HANDHELD_TERMINAL_ERA96_WIRING_PATHS;

export const POS_HANDHELD_TERMINAL_ERA171_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → POS → Handheld on a phone or tablet (375px+ width).",
  "Select a table, add items to cart, tap Fire to KDS — verify kitchen work items created.",
  "Complete cash checkout or queue offline sale — verify tab sync and KDS link.",
  "Run npm run smoke:pos-handheld-terminal-era96 — canonical era96 wiring cert PASSED.",
  "Run npm run smoke:pos-handheld-terminal-era171 — artifact overall PASSED.",
] as const;

export const POS_HANDHELD_TERMINAL_ERA171_CI_SCRIPTS = [
  "test:ci:pos-handheld-terminal-era171",
  "test:ci:pos-handheld-terminal-era171:cert",
] as const;

export const POS_HANDHELD_TERMINAL_ERA171_UNIT_TESTS = [
  "tests/unit/pos-handheld-terminal-era171.test.ts",
  "tests/unit/pos-handheld-terminal-era96.test.ts",
  "tests/unit/handheld-kds-fire.test.ts",
] as const;

export const POS_HANDHELD_TERMINAL_ERA171_CANONICAL_POLICY_ID = POS_HANDHELD_TERMINAL_ERA96_POLICY_ID;

export const POS_HANDHELD_TERMINAL_ERA171_ROUTE = POS_HANDHELD_TERMINAL_ERA96_ROUTE;

export const POS_HANDHELD_TERMINAL_ERA171_KDS_ROUTE = POS_HANDHELD_TERMINAL_ERA96_KDS_ROUTE;

export const POS_HANDHELD_TERMINAL_ERA171_MIN_TOUCH_PX = POS_HANDHELD_TERMINAL_ERA96_MIN_TOUCH_PX;

export const POS_HANDHELD_TERMINAL_ERA171_CAPABILITIES = [
  "table_select",
  "waiter_ordering",
  "kds_fire",
  "tab_sync",
] as const;
