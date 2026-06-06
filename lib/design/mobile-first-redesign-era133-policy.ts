/**
 * Era 133 — Mobile-First Redesign wiring cert (Phase 8 #60).
 *
 * Full path: 375px viewport → 44px touch floor → swipe nav dismiss.
 */

import {
  MOBILE_FIRST_REDESIGN_POLICY_ID,
  MOBILE_FIRST_REDESIGN_MODULES,
} from "@/lib/design/mobile-first-redesign-policy";

export const MOBILE_FIRST_REDESIGN_ERA133_POLICY_ID =
  "era133-mobile-first-redesign-v1" as const;

export const MOBILE_FIRST_REDESIGN_ERA133_SUMMARY_ARTIFACT =
  "artifacts/mobile-first-redesign-smoke-summary.json" as const;

export const MOBILE_FIRST_REDESIGN_ERA133_NPM_SCRIPT =
  "smoke:mobile-first-redesign-era133" as const;

export const MOBILE_FIRST_REDESIGN_ERA133_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-mobile-first-redesign-era133.ts" as const;

export const MOBILE_FIRST_REDESIGN_ERA133_OPS_DOC =
  "docs/mobile-first-redesign-era133-setup.md" as const;

export const MOBILE_FIRST_REDESIGN_ERA133_SERVICE =
  "services/design/mobile-first-redesign-service.ts" as const;

export const MOBILE_FIRST_REDESIGN_ERA133_WIRING_PATHS = [
  MOBILE_FIRST_REDESIGN_ERA133_SERVICE,
  "lib/design/mobile-first-redesign-policy.ts",
  "lib/design/mobile-first-redesign-patterns.ts",
  "lib/design/mobile-first-redesign-audit-policy.ts",
  "components/dashboard/dashboard-shell.tsx",
] as const;

export const MOBILE_FIRST_REDESIGN_ERA133_CYCLE_RUNBOOK_STEPS = [
  "Resize browser to 375px width — verify dashboard shell padding and nav drawer.",
  "Tap nav trigger, role pills, and shortcut tiles — confirm 44px minimum targets.",
  "Swipe left on open nav drawer — drawer dismisses (one-hand gesture).",
  "Run npm run test:ci:mobile-first-redesign-era133 — all audited modules PASS.",
  "Run npm run smoke:mobile-first-redesign-era133 — artifact overall PASSED.",
] as const;

export const MOBILE_FIRST_REDESIGN_ERA133_CI_SCRIPTS = [
  "test:ci:mobile-first-redesign-era133",
  "test:ci:mobile-first-redesign-era133:cert",
] as const;

export const MOBILE_FIRST_REDESIGN_ERA133_UNIT_TESTS = [
  "tests/unit/mobile-first-redesign-era133.test.ts",
  "tests/unit/mobile-first-redesign-policy.test.ts",
] as const;

export const MOBILE_FIRST_REDESIGN_ERA133_CANONICAL_POLICY_ID =
  MOBILE_FIRST_REDESIGN_POLICY_ID;

export const MOBILE_FIRST_REDESIGN_ERA133_AUDITED_MODULES =
  MOBILE_FIRST_REDESIGN_MODULES;

export const MOBILE_FIRST_REDESIGN_ERA133_DIMENSIONS = [
  "viewport",
  "touch",
  "swipe",
] as const;
