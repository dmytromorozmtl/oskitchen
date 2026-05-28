/**
 * Pilot preflight marketing claims policy — Evolution Era 8 Cycle 3.
 *
 * Paid pilot / staging deploy preflight must run `verify-claims` in strict mode
 * so unqualified roadmap terms fail the gate — not only forbidden phrases.
 */

export const PILOT_PREFLIGHT_CLAIMS_POLICY_ID =
  "era8-pilot-preflight-claims-strict-v1" as const;

export const PILOT_PREFLIGHT_CLAIMS_EXTENDS_POLICY_ID =
  "era7-marketing-claims-governance-v1" as const;

export const PILOT_PREFLIGHT_SCRIPT_PATH = "scripts/ops/pilot-preflight.sh" as const;

export const PILOT_PREFLIGHT_STRICT_ENV = "MARKETING_CLAIMS_STRICT" as const;

export const PILOT_PREFLIGHT_STRICT_ENV_VALUE = "1" as const;

export const PILOT_PREFLIGHT_VERIFY_CLAIMS_SCRIPT = "verify-claims" as const;

export const PILOT_PREFLIGHT_CLAIMS_CI_SCRIPTS = [
  "test:ci:pilot-preflight-claims",
  "test:ci:pilot-preflight-claims:cert",
] as const;

export const PILOT_PREFLIGHT_CLAIMS_UNIT_TESTS = [
  "tests/unit/pilot-preflight-claims-policy.test.ts",
  "tests/unit/pilot-preflight-claims-ci-live.test.ts",
] as const;

export const PILOT_PREFLIGHT_CLAIMS_CANONICAL_DOC_PATHS = [
  "docs/commercial-pilot-runbook.md",
  "docs/devops-release-enterprise-readiness.md",
  "docs/qa-master-test-plan.md",
] as const;

export const PILOT_PREFLIGHT_CLAIMS_CANONICAL_MARKERS = [
  PILOT_PREFLIGHT_CLAIMS_POLICY_ID,
  "MARKETING_CLAIMS_STRICT=1",
  "pilot-preflight",
] as const;

/**
 * Returns true when the preflight shell script runs verify-claims with strict env.
 */
export function pilotPreflightEnforcesStrictClaims(shellScript: string): boolean {
  const normalized = shellScript.replace(/\r\n/g, "\n");
  const hasStrict =
    normalized.includes(`${PILOT_PREFLIGHT_STRICT_ENV}=${PILOT_PREFLIGHT_STRICT_ENV_VALUE}`) ||
    normalized.includes(
      `env ${PILOT_PREFLIGHT_STRICT_ENV}=${PILOT_PREFLIGHT_STRICT_ENV_VALUE}`,
    );
  const hasVerify =
    normalized.includes(`run ${PILOT_PREFLIGHT_VERIFY_CLAIMS_SCRIPT}`) ||
    normalized.includes(PILOT_PREFLIGHT_VERIFY_CLAIMS_SCRIPT);
  return hasStrict && hasVerify;
}
