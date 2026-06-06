/**
 * Era 92 — Desktop POS wiring cert (Phase 2 extension #92).
 *
 * Full path: keyboard shortcuts → multi-monitor customer display → terminal wiring.
 */

export const POS_DESKTOP_TERMINAL_ERA92_POLICY_ID = "era92-pos-desktop-terminal-v1" as const;

export const POS_DESKTOP_TERMINAL_ERA92_SUMMARY_ARTIFACT =
  "artifacts/pos-desktop-terminal-smoke-summary.json" as const;

export const POS_DESKTOP_TERMINAL_ERA92_NPM_SCRIPT = "smoke:pos-desktop-terminal" as const;

export const POS_DESKTOP_TERMINAL_ERA92_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-desktop-terminal-era92.ts" as const;

export const POS_DESKTOP_TERMINAL_ERA92_OPS_DOC = "docs/pos-desktop-terminal-era92-setup.md" as const;

export const POS_DESKTOP_TERMINAL_ERA92_WIRING_PATHS = [
  "app/dashboard/pos/terminal/page.tsx",
  "app/dashboard/pos/terminal/customer-display/page.tsx",
  "components/dashboard/pos-terminal-client.tsx",
  "components/pos/pos-desktop-shortcuts-overlay.tsx",
  "components/pos/customer-display.tsx",
  "lib/keyboard/shortcuts.ts",
  "lib/pos/pos-multi-monitor.ts",
  "lib/pos/pos-desktop-shortcuts-policy.ts",
] as const;

export const POS_DESKTOP_TERMINAL_ERA92_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → POS → Terminal on a desktop browser (1280px+ width).",
  "Press F9 to open keyboard shortcut overlay — verify F1–F9 bindings.",
  "Press F8 or click Open customer display — second window on extended monitor.",
  "Run npm run smoke:pos-desktop-terminal-era92 — artifact overall PASSED.",
] as const;

export const POS_DESKTOP_TERMINAL_ERA92_CI_SCRIPTS = [
  "test:ci:pos-desktop-terminal-era92",
  "test:ci:pos-desktop-terminal-era92:cert",
] as const;

export const POS_DESKTOP_TERMINAL_ERA92_UNIT_TESTS = [
  "tests/unit/pos-desktop-terminal-era92.test.ts",
  "tests/unit/pos-desktop-shortcuts.test.ts",
] as const;

export const POS_DESKTOP_TERMINAL_ERA92_ROUTE = "/dashboard/pos/terminal" as const;
