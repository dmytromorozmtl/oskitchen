/**
 * Era 174 — POS Customer Display wiring cert (Phase 2 Round 2 #26).
 *
 * Full path: terminal cart → BroadcastChannel → second-screen CustomerDisplay popup.
 */

import {
  POS_CUSTOMER_DISPLAY_ERA99_CHANNEL,
  POS_CUSTOMER_DISPLAY_ERA99_COMPONENT,
  POS_CUSTOMER_DISPLAY_ERA99_OPS_DOC,
  POS_CUSTOMER_DISPLAY_ERA99_POLICY_ID,
  POS_CUSTOMER_DISPLAY_ERA99_ROUTE,
  POS_CUSTOMER_DISPLAY_ERA99_SUMMARY_ARTIFACT,
  POS_CUSTOMER_DISPLAY_ERA99_WIRING_PATHS,
} from "@/lib/pos/pos-customer-display-era99-policy";

export const POS_CUSTOMER_DISPLAY_ERA174_POLICY_ID = "era174-pos-customer-display-v1" as const;

export const POS_CUSTOMER_DISPLAY_ERA174_SUMMARY_ARTIFACT =
  "artifacts/pos-customer-display-era174-smoke-summary.json" as const;

export const POS_CUSTOMER_DISPLAY_ERA174_NPM_SCRIPT = "smoke:pos-customer-display-era174" as const;

export const POS_CUSTOMER_DISPLAY_ERA174_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-customer-display-era174.ts" as const;

export const POS_CUSTOMER_DISPLAY_ERA174_OPS_DOC = "docs/pos-customer-display-era174-setup.md" as const;

export const POS_CUSTOMER_DISPLAY_ERA174_CANONICAL_OPS_DOC = POS_CUSTOMER_DISPLAY_ERA99_OPS_DOC;

export const POS_CUSTOMER_DISPLAY_ERA174_CANONICAL_SUMMARY_ARTIFACT =
  POS_CUSTOMER_DISPLAY_ERA99_SUMMARY_ARTIFACT;

export const POS_CUSTOMER_DISPLAY_ERA174_WIRING_PATHS = POS_CUSTOMER_DISPLAY_ERA99_WIRING_PATHS;

export const POS_CUSTOMER_DISPLAY_ERA174_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → POS → Terminal on a dual-monitor workstation.",
  "Press F8 or toolbar toggle — customer display popup opens on second screen.",
  "Add items to cart — verify live totals sync via BroadcastChannel.",
  "Run npm run smoke:pos-customer-display-era99 — canonical era99 wiring cert PASSED.",
  "Run npm run smoke:pos-customer-display-era174 — artifact overall PASSED.",
] as const;

export const POS_CUSTOMER_DISPLAY_ERA174_CI_SCRIPTS = [
  "test:ci:pos-customer-display-era174",
  "test:ci:pos-customer-display-era174:cert",
] as const;

export const POS_CUSTOMER_DISPLAY_ERA174_UNIT_TESTS = [
  "tests/unit/pos-customer-display-era174.test.ts",
  "tests/unit/pos-customer-display-era99.test.ts",
  "tests/unit/pos-customer-display.test.ts",
] as const;

export const POS_CUSTOMER_DISPLAY_ERA174_CANONICAL_POLICY_ID = POS_CUSTOMER_DISPLAY_ERA99_POLICY_ID;

export const POS_CUSTOMER_DISPLAY_ERA174_ROUTE = POS_CUSTOMER_DISPLAY_ERA99_ROUTE;

export const POS_CUSTOMER_DISPLAY_ERA174_COMPONENT = POS_CUSTOMER_DISPLAY_ERA99_COMPONENT;

export const POS_CUSTOMER_DISPLAY_ERA174_CHANNEL = POS_CUSTOMER_DISPLAY_ERA99_CHANNEL;

export const POS_CUSTOMER_DISPLAY_ERA174_CAPABILITIES = [
  "second_screen",
  "broadcast_channel",
  "live_totals_sync",
  "f8_toggle",
] as const;
