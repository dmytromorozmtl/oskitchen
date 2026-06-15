/**
 * Era 99 — POS Customer Display wiring cert (Phase 2 extension #99).
 *
 * Full path: terminal cart → BroadcastChannel → second-screen CustomerDisplay popup.
 */

export const POS_CUSTOMER_DISPLAY_ERA99_POLICY_ID = "era99-pos-customer-display-v1" as const;

export const POS_CUSTOMER_DISPLAY_ERA99_SUMMARY_ARTIFACT =
  "artifacts/pos-customer-display-smoke-summary.json" as const;

export const POS_CUSTOMER_DISPLAY_ERA99_NPM_SCRIPT = "smoke:pos-customer-display-era99" as const;

export const POS_CUSTOMER_DISPLAY_ERA99_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-customer-display-era99.ts" as const;

export const POS_CUSTOMER_DISPLAY_ERA99_OPS_DOC = "docs/pos-customer-display-era99-setup.md" as const;

export const POS_CUSTOMER_DISPLAY_ERA99_WIRING_PATHS = [
  "components/pos/customer-display.tsx",
  "components/pos/pos-customer-display-client.tsx",
  "app/dashboard/pos/terminal/customer-display/page.tsx",
  "lib/pos/pos-multi-monitor.ts",
  "lib/pos/pos-desktop-shortcuts-policy.ts",
  "components/dashboard/pos-terminal-client.tsx",
] as const;

export const POS_CUSTOMER_DISPLAY_ERA99_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → POS → Terminal on a dual-monitor workstation.",
  "Press F8 or toolbar toggle — customer display popup opens on second screen.",
  "Add items to cart — verify live totals sync via BroadcastChannel.",
  "Run npm run smoke:pos-customer-display-era99 — artifact overall PASSED.",
] as const;

export const POS_CUSTOMER_DISPLAY_ERA99_CI_SCRIPTS = [
  "test:ci:pos-customer-display-era99",
  "test:ci:pos-customer-display-era99:cert",
] as const;

export const POS_CUSTOMER_DISPLAY_ERA99_UNIT_TESTS = [
  "tests/unit/pos-customer-display-era99.test.ts",
  "tests/unit/pos-customer-display.test.ts",
] as const;

export const POS_CUSTOMER_DISPLAY_ERA99_ROUTE =
  "/dashboard/pos/terminal/customer-display" as const;

export const POS_CUSTOMER_DISPLAY_ERA99_COMPONENT = "components/pos/customer-display.tsx" as const;

export const POS_CUSTOMER_DISPLAY_ERA99_CHANNEL = "kitchenos-pos-customer-display-v1" as const;
