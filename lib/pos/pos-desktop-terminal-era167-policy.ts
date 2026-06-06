/**
 * Era 167 — Desktop POS wiring cert (Phase 2 Round 2 #19).
 *
 * Full path: keyboard shortcuts → multi-monitor customer display → terminal wiring.
 */

import {
  POS_DESKTOP_TERMINAL_ERA92_OPS_DOC,
  POS_DESKTOP_TERMINAL_ERA92_POLICY_ID,
  POS_DESKTOP_TERMINAL_ERA92_ROUTE,
  POS_DESKTOP_TERMINAL_ERA92_SUMMARY_ARTIFACT,
  POS_DESKTOP_TERMINAL_ERA92_WIRING_PATHS,
} from "@/lib/pos/pos-desktop-terminal-era92-policy";

export const POS_DESKTOP_TERMINAL_ERA167_POLICY_ID = "era167-pos-desktop-terminal-v1" as const;

export const POS_DESKTOP_TERMINAL_ERA167_SUMMARY_ARTIFACT =
  "artifacts/pos-desktop-terminal-era167-smoke-summary.json" as const;

export const POS_DESKTOP_TERMINAL_ERA167_NPM_SCRIPT = "smoke:pos-desktop-terminal-era167" as const;

export const POS_DESKTOP_TERMINAL_ERA167_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-desktop-terminal-era167.ts" as const;

export const POS_DESKTOP_TERMINAL_ERA167_OPS_DOC = "docs/pos-desktop-terminal-era167-setup.md" as const;

export const POS_DESKTOP_TERMINAL_ERA167_CANONICAL_OPS_DOC = POS_DESKTOP_TERMINAL_ERA92_OPS_DOC;

export const POS_DESKTOP_TERMINAL_ERA167_CANONICAL_SUMMARY_ARTIFACT =
  POS_DESKTOP_TERMINAL_ERA92_SUMMARY_ARTIFACT;

export const POS_DESKTOP_TERMINAL_ERA167_WIRING_PATHS = POS_DESKTOP_TERMINAL_ERA92_WIRING_PATHS;

export const POS_DESKTOP_TERMINAL_ERA167_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → POS → Terminal on a desktop browser (1280px+ width).",
  "Press F9 to open keyboard shortcut overlay — verify F1–F9 bindings.",
  "Press F8 or click Open customer display — second window on extended monitor.",
  "Run npm run smoke:pos-desktop-terminal-era92 — canonical era92 wiring cert PASSED.",
  "Run npm run smoke:pos-desktop-terminal-era167 — artifact overall PASSED.",
] as const;

export const POS_DESKTOP_TERMINAL_ERA167_CI_SCRIPTS = [
  "test:ci:pos-desktop-terminal-era167",
  "test:ci:pos-desktop-terminal-era167:cert",
] as const;

export const POS_DESKTOP_TERMINAL_ERA167_UNIT_TESTS = [
  "tests/unit/pos-desktop-terminal-era167.test.ts",
  "tests/unit/pos-desktop-terminal-era92.test.ts",
  "tests/unit/pos-desktop-shortcuts.test.ts",
] as const;

export const POS_DESKTOP_TERMINAL_ERA167_CANONICAL_POLICY_ID = POS_DESKTOP_TERMINAL_ERA92_POLICY_ID;

export const POS_DESKTOP_TERMINAL_ERA167_ROUTE = POS_DESKTOP_TERMINAL_ERA92_ROUTE;

export const POS_DESKTOP_TERMINAL_ERA167_CAPABILITIES = [
  "keyboard_shortcuts",
  "multi_monitor",
] as const;
