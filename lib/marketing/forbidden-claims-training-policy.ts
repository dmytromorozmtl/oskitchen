/**
 * Blueprint P1-84 — Forbidden claims training (quiz + certification).
 *
 * @see docs/forbidden-claims-training.md
 * @see app/trust/forbidden-claims-training/page.tsx
 */

export const FORBIDDEN_CLAIMS_TRAINING_POLICY_ID =
  "forbidden-claims-training-p1-84-v1" as const;

export const FORBIDDEN_CLAIMS_TRAINING_DOC = "docs/forbidden-claims-training.md" as const;

export const FORBIDDEN_CLAIMS_TRAINING_CONTENT_PATH =
  "lib/marketing/forbidden-claims-training-content.ts" as const;

export const FORBIDDEN_CLAIMS_TRAINING_QUIZ_COMPONENT =
  "components/marketing/forbidden-claims-training-quiz.tsx" as const;

export const FORBIDDEN_CLAIMS_TRAINING_PAGE =
  "app/trust/forbidden-claims-training/page.tsx" as const;

export const FORBIDDEN_CLAIMS_TRAINING_ROUTE =
  "/trust/forbidden-claims-training" as const;

export const FORBIDDEN_CLAIMS_TRAINING_QUIZ_TEST_ID =
  "forbidden-claims-training-quiz" as const;

export const FORBIDDEN_CLAIMS_TRAINING_CERTIFICATION_TEST_ID =
  "forbidden-claims-certification" as const;

export const FORBIDDEN_CLAIMS_TRAINING_HEADLINE =
  "Forbidden claims training — quiz & certification" as const;

export const FORBIDDEN_CLAIMS_TRAINING_QUESTION_COUNT = 10 as const;

export const FORBIDDEN_CLAIMS_TRAINING_PASS_THRESHOLD = 8 as const;

export const FORBIDDEN_CLAIMS_TRAINING_PASS_PERCENT = 80 as const;

export const FORBIDDEN_CLAIMS_TRAINING_HONESTY_MARKERS = [
  "SKIPPED",
  "BETA",
  "verify",
  "honest",
  "FORBIDDEN",
] as const;

export const FORBIDDEN_CLAIMS_TRAINING_AUDIT_SCRIPT =
  "scripts/audit-forbidden-claims-training.ts" as const;

export const FORBIDDEN_CLAIMS_TRAINING_NPM_SCRIPT =
  "audit:forbidden-claims-training" as const;

export const FORBIDDEN_CLAIMS_TRAINING_UNIT_TEST =
  "tests/unit/forbidden-claims-training.test.ts" as const;

export const FORBIDDEN_CLAIMS_TRAINING_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const FORBIDDEN_CLAIMS_TRAINING_WIRING_PATHS = [
  FORBIDDEN_CLAIMS_TRAINING_DOC,
  FORBIDDEN_CLAIMS_TRAINING_CONTENT_PATH,
  FORBIDDEN_CLAIMS_TRAINING_QUIZ_COMPONENT,
  FORBIDDEN_CLAIMS_TRAINING_PAGE,
  "lib/marketing/forbidden-claims-training-policy.ts",
  "lib/marketing/forbidden-claims-training-audit.ts",
  FORBIDDEN_CLAIMS_TRAINING_UNIT_TEST,
  "marketing/forbidden-claims-training.md",
] as const;
