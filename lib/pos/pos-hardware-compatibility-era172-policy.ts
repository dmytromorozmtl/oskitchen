/**
 * Era 172 — POS Hardware Compatibility doc cert (Phase 2 Round 2 #24).
 *
 * Full path: certified device catalog → in-app matrix → operator field checklist.
 */

import {
  POS_HARDWARE_COMPATIBILITY_ERA97_DOC,
  POS_HARDWARE_COMPATIBILITY_ERA97_HARDWARE_ROUTE,
  POS_HARDWARE_COMPATIBILITY_ERA97_OPS_DOC,
  POS_HARDWARE_COMPATIBILITY_ERA97_POLICY_ID,
  POS_HARDWARE_COMPATIBILITY_ERA97_REQUIRED_VENDORS,
  POS_HARDWARE_COMPATIBILITY_ERA97_SUMMARY_ARTIFACT,
  POS_HARDWARE_COMPATIBILITY_ERA97_WIRING_PATHS,
} from "@/lib/pos/pos-hardware-compatibility-era97-policy";

export const POS_HARDWARE_COMPATIBILITY_ERA172_POLICY_ID =
  "era172-pos-hardware-compatibility-v1" as const;

export const POS_HARDWARE_COMPATIBILITY_ERA172_SUMMARY_ARTIFACT =
  "artifacts/pos-hardware-compatibility-era172-smoke-summary.json" as const;

export const POS_HARDWARE_COMPATIBILITY_ERA172_NPM_SCRIPT =
  "smoke:pos-hardware-compatibility-era172" as const;

export const POS_HARDWARE_COMPATIBILITY_ERA172_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-hardware-compatibility-era172.ts" as const;

export const POS_HARDWARE_COMPATIBILITY_ERA172_OPS_DOC =
  "docs/pos-hardware-compatibility-era172-setup.md" as const;

export const POS_HARDWARE_COMPATIBILITY_ERA172_CANONICAL_OPS_DOC =
  POS_HARDWARE_COMPATIBILITY_ERA97_OPS_DOC;

export const POS_HARDWARE_COMPATIBILITY_ERA172_CANONICAL_SUMMARY_ARTIFACT =
  POS_HARDWARE_COMPATIBILITY_ERA97_SUMMARY_ARTIFACT;

export const POS_HARDWARE_COMPATIBILITY_ERA172_DOC = POS_HARDWARE_COMPATIBILITY_ERA97_DOC;

export const POS_HARDWARE_COMPATIBILITY_ERA172_WIRING_PATHS =
  POS_HARDWARE_COMPATIBILITY_ERA97_WIRING_PATHS;

export const POS_HARDWARE_COMPATIBILITY_ERA172_REQUIRED_VENDORS =
  POS_HARDWARE_COMPATIBILITY_ERA97_REQUIRED_VENDORS;

export const POS_HARDWARE_COMPATIBILITY_ERA172_CYCLE_RUNBOOK_STEPS = [
  "Open docs/hardware-compatibility.md — verify Epson, PAX, Star Micronics, barcode scanners.",
  "Open Dashboard → POS → Settings → Hardware — confirm matrix matches catalog tiers.",
  "Field checklist: wedge scanner + Epson/Star browser print + Stripe Terminal or PAX external.",
  "Run npm run smoke:pos-hardware-compatibility-era97 — canonical era97 wiring cert PASSED.",
  "Run npm run smoke:pos-hardware-compatibility-era172 — artifact overall PASSED.",
] as const;

export const POS_HARDWARE_COMPATIBILITY_ERA172_CI_SCRIPTS = [
  "test:ci:pos-hardware-compatibility-era172",
  "test:ci:pos-hardware-compatibility-era172:cert",
] as const;

export const POS_HARDWARE_COMPATIBILITY_ERA172_UNIT_TESTS = [
  "tests/unit/pos-hardware-compatibility-era172.test.ts",
  "tests/unit/pos-hardware-compatibility-era97.test.ts",
  "tests/unit/pos-hardware-compatibility.test.ts",
] as const;

export const POS_HARDWARE_COMPATIBILITY_ERA172_CANONICAL_POLICY_ID =
  POS_HARDWARE_COMPATIBILITY_ERA97_POLICY_ID;

export const POS_HARDWARE_COMPATIBILITY_ERA172_HARDWARE_ROUTE =
  POS_HARDWARE_COMPATIBILITY_ERA97_HARDWARE_ROUTE;

export const POS_HARDWARE_COMPATIBILITY_ERA172_CAPABILITIES = [
  "epson_receipt_printers",
  "pax_payment_terminals",
  "star_micronics_printers",
  "barcode_scanners",
] as const;
