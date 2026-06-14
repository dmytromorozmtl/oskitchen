/**
 * P0-6 — Forbidden claims CI gate (blocks merge on banned marketing phrases).
 *
 * @see scripts/gate-forbidden-claims.ts
 * @see artifacts/forbidden-claims-ci-gate.json
 */

export const FORBIDDEN_CLAIMS_CI_GATE_POLICY_ID =
  "p0-6-forbidden-claims-ci-gate-v1" as const;

export const FORBIDDEN_CLAIMS_CI_GATE_ARTIFACT =
  "artifacts/forbidden-claims-ci-gate.json" as const;

export const FORBIDDEN_CLAIMS_CI_GATE_SCRIPT = "scripts/gate-forbidden-claims.ts" as const;

export const FORBIDDEN_CLAIMS_CI_GATE_NPM_SCRIPT = "gate:forbidden-claims" as const;

export const FORBIDDEN_CLAIMS_CI_GATE_TEST_SCRIPT =
  "test:ci:forbidden-claims-p0-6" as const;

export const FORBIDDEN_CLAIMS_CI_GATE_ENFORCEMENT_SCRIPT =
  "test:ci:forbidden-claims-enforcement" as const;

export const FORBIDDEN_CLAIMS_CI_GATE_UNIT_TEST =
  "tests/unit/forbidden-claims-ci-gate-p0-6.test.ts" as const;

export const FORBIDDEN_CLAIMS_CI_GATE_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const FORBIDDEN_CLAIMS_CI_GATE_VERIFY_WORKFLOW =
  ".github/workflows/verify-claims.yml" as const;

export const FORBIDDEN_CLAIMS_CI_GATE_STRICT_ENV = "MARKETING_CLAIMS_STRICT" as const;

/** Hard-fail categories for merge gate (forbidden phrases always block). */
export const FORBIDDEN_CLAIMS_CI_GATE_BLOCKING_KINDS = ["forbidden"] as const;
