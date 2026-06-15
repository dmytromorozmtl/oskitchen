/**
 * Era 97 — POS Hardware Compatibility doc cert (Phase 2 extension #97).
 *
 * Full path: certified device catalog → in-app matrix → operator field checklist.
 */

export const POS_HARDWARE_COMPATIBILITY_ERA97_POLICY_ID =
  "era97-pos-hardware-compatibility-v1" as const;

export const POS_HARDWARE_COMPATIBILITY_ERA97_SUMMARY_ARTIFACT =
  "artifacts/pos-hardware-compatibility-smoke-summary.json" as const;

export const POS_HARDWARE_COMPATIBILITY_ERA97_NPM_SCRIPT =
  "smoke:pos-hardware-compatibility-era97" as const;

export const POS_HARDWARE_COMPATIBILITY_ERA97_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-hardware-compatibility-era97.ts" as const;

export const POS_HARDWARE_COMPATIBILITY_ERA97_OPS_DOC =
  "docs/pos-hardware-compatibility-era97-setup.md" as const;

export const POS_HARDWARE_COMPATIBILITY_ERA97_DOC = "docs/hardware-compatibility.md" as const;

export const POS_HARDWARE_COMPATIBILITY_ERA97_REQUIRED_VENDORS = [
  "Epson",
  "PAX",
  "Star Micronics",
] as const;

export const POS_HARDWARE_COMPATIBILITY_ERA97_WIRING_PATHS = [
  "docs/hardware-compatibility.md",
  "lib/pos/pos-hardware-certification.ts",
  "lib/pos/pos-hardware.ts",
  "app/dashboard/pos/settings/hardware/page.tsx",
  "tests/unit/pos-hardware-compatibility.test.ts",
] as const;

export const POS_HARDWARE_COMPATIBILITY_ERA97_CYCLE_RUNBOOK_STEPS = [
  "Open docs/hardware-compatibility.md — verify Epson, PAX, Star Micronics, barcode scanners.",
  "Open Dashboard → POS → Settings → Hardware — confirm matrix matches catalog tiers.",
  "Field checklist: wedge scanner + Epson/Star browser print + Stripe Terminal or PAX external.",
  "Run npm run smoke:pos-hardware-compatibility-era97 — artifact overall PASSED.",
] as const;

export const POS_HARDWARE_COMPATIBILITY_ERA97_CI_SCRIPTS = [
  "test:ci:pos-hardware-compatibility-era97",
  "test:ci:pos-hardware-compatibility-era97:cert",
] as const;

export const POS_HARDWARE_COMPATIBILITY_ERA97_UNIT_TESTS = [
  "tests/unit/pos-hardware-compatibility-era97.test.ts",
  "tests/unit/pos-hardware-compatibility.test.ts",
] as const;

export const POS_HARDWARE_COMPATIBILITY_ERA97_HARDWARE_ROUTE =
  "/dashboard/pos/settings/hardware" as const;
