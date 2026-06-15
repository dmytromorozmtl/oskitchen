/**
 * Era 195 — Marketplace Quality Scoring wiring cert (Phase 6 Round 2 #47).
 *
 * Full path: reviews → supplier scores → tier rankings → quality alerts.
 */

import {
  QUALITY_SCORING_ERA120_DIMENSIONS,
  QUALITY_SCORING_ERA120_OPS_DOC,
  QUALITY_SCORING_ERA120_POLICY_ID,
  QUALITY_SCORING_ERA120_ROUTE,
  QUALITY_SCORING_ERA120_SERVICE,
  QUALITY_SCORING_ERA120_SUMMARY_ARTIFACT,
  QUALITY_SCORING_ERA120_TIERS,
  QUALITY_SCORING_ERA120_WIRING_PATHS,
} from "@/lib/marketplace/marketplace-quality-scoring-era120-policy";

export const QUALITY_SCORING_ERA195_POLICY_ID = "era195-marketplace-quality-scoring-v1" as const;

export const QUALITY_SCORING_ERA195_SUMMARY_ARTIFACT =
  "artifacts/marketplace-quality-scoring-era195-smoke-summary.json" as const;

export const QUALITY_SCORING_ERA195_NPM_SCRIPT = "smoke:marketplace-quality-scoring-era195" as const;

export const QUALITY_SCORING_ERA195_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-marketplace-quality-scoring-era195.ts" as const;

export const QUALITY_SCORING_ERA195_OPS_DOC = "docs/marketplace-quality-scoring-era195-setup.md" as const;

export const QUALITY_SCORING_ERA195_CANONICAL_OPS_DOC = QUALITY_SCORING_ERA120_OPS_DOC;

export const QUALITY_SCORING_ERA195_CANONICAL_SUMMARY_ARTIFACT =
  QUALITY_SCORING_ERA120_SUMMARY_ARTIFACT;

export const QUALITY_SCORING_ERA195_WIRING_PATHS = QUALITY_SCORING_ERA120_WIRING_PATHS;

export const QUALITY_SCORING_ERA195_SERVICE = QUALITY_SCORING_ERA120_SERVICE;

export const QUALITY_SCORING_ERA195_ROUTE = QUALITY_SCORING_ERA120_ROUTE;

export const QUALITY_SCORING_ERA195_DIMENSIONS = QUALITY_SCORING_ERA120_DIMENSIONS;

export const QUALITY_SCORING_ERA195_TIERS = QUALITY_SCORING_ERA120_TIERS;

export const QUALITY_SCORING_ERA195_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Marketplace → Quality Scoring.",
  "Review workspace supplier scores — quality, accuracy, delivery, packaging.",
  "Check tier rankings (Excellent, Good, Watch, Avoid).",
  "Submit pending reviews for delivered POs and verify alerts.",
  "Run npm run smoke:marketplace-quality-scoring-era120 — canonical era120 wiring cert PASSED.",
  "Run npm run smoke:marketplace-quality-scoring-era195 — artifact overall PASSED.",
] as const;

export const QUALITY_SCORING_ERA195_CI_SCRIPTS = [
  "test:ci:marketplace-quality-scoring-era195",
  "test:ci:marketplace-quality-scoring-era195:cert",
] as const;

export const QUALITY_SCORING_ERA195_UNIT_TESTS = [
  "tests/unit/marketplace-quality-scoring-era195.test.ts",
  "tests/unit/marketplace-quality-scoring-era120.test.ts",
  "tests/unit/quality-scoring.test.ts",
] as const;

export const QUALITY_SCORING_ERA195_CANONICAL_POLICY_ID = QUALITY_SCORING_ERA120_POLICY_ID;
