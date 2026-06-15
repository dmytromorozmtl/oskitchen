/**
 * Era 135 — Design System docs wiring cert (Phase 8 #62).
 *
 * Full path: canonical doc → policy registry → section validation.
 */

import {
  DESIGN_SYSTEM_DOC_ANCHORS,
  DESIGN_SYSTEM_DOC_PATH,
  DESIGN_SYSTEM_DOC_POLICY_ID,
  DESIGN_SYSTEM_POLICY_MODULES,
} from "@/lib/design/design-system-doc-policy";

export const DESIGN_SYSTEM_DOC_ERA135_POLICY_ID = "era135-design-system-doc-v1" as const;

export const DESIGN_SYSTEM_DOC_ERA135_SUMMARY_ARTIFACT =
  "artifacts/design-system-doc-smoke-summary.json" as const;

export const DESIGN_SYSTEM_DOC_ERA135_NPM_SCRIPT = "smoke:design-system-doc-era135" as const;

export const DESIGN_SYSTEM_DOC_ERA135_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-design-system-doc-era135.ts" as const;

export const DESIGN_SYSTEM_DOC_ERA135_OPS_DOC = "docs/design-system-doc-era135-setup.md" as const;

export const DESIGN_SYSTEM_DOC_ERA135_SERVICE =
  "services/design/design-system-doc-service.ts" as const;

export const DESIGN_SYSTEM_DOC_ERA135_WIRING_PATHS = [
  DESIGN_SYSTEM_DOC_PATH,
  "lib/design/design-system-doc-policy.ts",
  DESIGN_SYSTEM_DOC_ERA135_SERVICE,
  "tests/unit/design-system-doc.test.ts",
] as const;

export const DESIGN_SYSTEM_DOC_ERA135_CYCLE_RUNBOOK_STEPS = [
  "Open docs/design-system.md — verify policy id and all required sections.",
  "Cross-check Token registry, Layout primitives, Role surfaces, Mobile-first, Dark mode.",
  "Confirm Audit policy index links DES-24 through DES-39 policy modules.",
  "Run npm run test:ci:design-system-doc-era135 — section validation PASS.",
  "Run npm run smoke:design-system-doc-era135 — artifact overall PASSED.",
] as const;

export const DESIGN_SYSTEM_DOC_ERA135_CI_SCRIPTS = [
  "test:ci:design-system-doc-era135",
  "test:ci:design-system-doc-era135:cert",
] as const;

export const DESIGN_SYSTEM_DOC_ERA135_UNIT_TESTS = [
  "tests/unit/design-system-doc-era135.test.ts",
  "tests/unit/design-system-doc.test.ts",
] as const;

export const DESIGN_SYSTEM_DOC_ERA135_CANONICAL_POLICY_ID = DESIGN_SYSTEM_DOC_POLICY_ID;

export const DESIGN_SYSTEM_DOC_ERA135_DOC_PATH = DESIGN_SYSTEM_DOC_PATH;

export const DESIGN_SYSTEM_DOC_ERA135_SECTIONS = DESIGN_SYSTEM_DOC_ANCHORS;

export const DESIGN_SYSTEM_DOC_ERA135_POLICY_MODULES = DESIGN_SYSTEM_POLICY_MODULES;
