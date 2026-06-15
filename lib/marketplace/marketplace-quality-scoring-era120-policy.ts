/**
 * Era 120 — Marketplace Quality Scoring wiring cert (Phase 6 extension #120).
 *
 * Full path: reviews → supplier scores → tier rankings → quality alerts.
 */

import { QUALITY_SCORING_POLICY_ID } from "@/lib/marketplace/quality-scoring-policy";

export const QUALITY_SCORING_ERA120_POLICY_ID = "era120-marketplace-quality-scoring-v1" as const;

export const QUALITY_SCORING_ERA120_SUMMARY_ARTIFACT =
  "artifacts/marketplace-quality-scoring-smoke-summary.json" as const;

export const QUALITY_SCORING_ERA120_NPM_SCRIPT = "smoke:marketplace-quality-scoring-era120" as const;

export const QUALITY_SCORING_ERA120_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-marketplace-quality-scoring-era120.ts" as const;

export const QUALITY_SCORING_ERA120_OPS_DOC = "docs/marketplace-quality-scoring-era120-setup.md" as const;

export const QUALITY_SCORING_ERA120_WIRING_PATHS = [
  "services/marketplace/quality-scoring.ts",
  "lib/marketplace/quality-scoring-builders.ts",
  "lib/marketplace/quality-scoring-policy.ts",
  "app/dashboard/marketplace/quality/page.tsx",
  "components/marketplace/quality-scoring-panel.tsx",
] as const;

export const QUALITY_SCORING_ERA120_CYCLE_RUNBOOK_STEPS = [
  "Open Dashboard → Marketplace → Quality Scoring.",
  "Review workspace supplier scores — quality, accuracy, delivery, packaging.",
  "Check tier rankings (Excellent, Good, Watch, Avoid).",
  "Submit pending reviews for delivered POs and verify alerts.",
  "Run npm run smoke:marketplace-quality-scoring-era120 — artifact overall PASSED.",
] as const;

export const QUALITY_SCORING_ERA120_CI_SCRIPTS = [
  "test:ci:marketplace-quality-scoring-era120",
  "test:ci:marketplace-quality-scoring-era120:cert",
] as const;

export const QUALITY_SCORING_ERA120_UNIT_TESTS = [
  "tests/unit/marketplace-quality-scoring-era120.test.ts",
  "tests/unit/quality-scoring.test.ts",
] as const;

export const QUALITY_SCORING_ERA120_CANONICAL_POLICY_ID = QUALITY_SCORING_POLICY_ID;

export const QUALITY_SCORING_ERA120_SERVICE = "services/marketplace/quality-scoring.ts" as const;

export const QUALITY_SCORING_ERA120_ROUTE = "/dashboard/marketplace/quality" as const;

export const QUALITY_SCORING_ERA120_DIMENSIONS = [
  "quality",
  "accuracy",
  "delivery",
  "packaging",
] as const;

export const QUALITY_SCORING_ERA120_TIERS = [
  "excellent",
  "good",
  "watch",
  "avoid",
  "unrated",
] as const;
