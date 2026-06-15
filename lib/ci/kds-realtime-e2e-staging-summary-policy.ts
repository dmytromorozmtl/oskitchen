/**
 * KDS Realtime Playwright staging E2E summary policy — Evolution Era 11 Cycle 3.
 *
 * Staging-only browser tier; not in default CI. CI must never imply browser E2E passed
 * when it was skipped. Extends era8 honest scope with explicit PASSED/SKIPPED/FAILED artifact.
 */

export const KDS_REALTIME_E2E_STAGING_SUMMARY_POLICY_ID =
  "era11-kds-realtime-e2e-staging-v1" as const;

export const KDS_REALTIME_E2E_STAGING_EXTENDS_POLICY_ID =
  "era8-kds-realtime-e2e-staging-v1" as const;

export type KdsRealtimeE2eStagingCiStatus = "PASSED" | "FAILED" | "SKIPPED";

export const KDS_REALTIME_E2E_STAGING_REQUIRED_SECRETS = [
  "E2E_LOGIN_EMAIL",
  "E2E_LOGIN_PASSWORD",
] as const;

export const KDS_REALTIME_E2E_STAGING_REQUIRED_ENV = [
  "ENABLE_KDS_V1_CERTIFIED",
] as const;

export const KDS_REALTIME_E2E_STAGING_PLAYWRIGHT_SPEC = "e2e/kds-realtime-staging.spec.ts" as const;

export const KDS_REALTIME_E2E_STAGING_SUMMARY_ARTIFACT =
  "ci-artifacts/kds-realtime-e2e-staging-summary.json" as const;

/** Always-on KDS certification (no browser). */
export const KDS_REALTIME_E2E_STAGING_ALWAYS_ON_SCRIPTS = [
  "test:ci:kds-staging-smoke",
  "test:ci:kds-realtime-smoke",
  "test:ci:kds-v1:integration",
] as const;

export type KdsRealtimeE2eStagingCiSummary = {
  policyId: typeof KDS_REALTIME_E2E_STAGING_SUMMARY_POLICY_ID;
  status: KdsRealtimeE2eStagingCiStatus;
  reason: string;
  secretsPresent: boolean;
  kdsGateEnabled: boolean;
  e2eStepOutcome: string | null;
  recordedAt: string;
  alwaysOnCertification: readonly string[];
};

export type ResolveKdsRealtimeE2eStagingCiInput = {
  e2eLoginEmail?: string | null;
  e2eLoginPassword?: string | null;
  enableKdsV1Certified?: string | null;
  nodeEnv?: string | null;
  e2eStepOutcome?: string | null;
};

export function secretsPresentForKdsRealtimeE2eStaging(
  input: Pick<ResolveKdsRealtimeE2eStagingCiInput, "e2eLoginEmail" | "e2eLoginPassword">,
): boolean {
  return Boolean(input.e2eLoginEmail?.trim() && input.e2eLoginPassword?.trim());
}

export function kdsV1GateEnabledForE2e(
  input: Pick<ResolveKdsRealtimeE2eStagingCiInput, "enableKdsV1Certified" | "nodeEnv">,
): boolean {
  if (input.nodeEnv === "production") return true;
  return input.enableKdsV1Certified?.trim() === "true";
}

export function resolveKdsRealtimeE2eStagingCiStatus(
  input: ResolveKdsRealtimeE2eStagingCiInput,
): Pick<
  KdsRealtimeE2eStagingCiSummary,
  "status" | "reason" | "secretsPresent" | "kdsGateEnabled" | "e2eStepOutcome"
> {
  const secretsPresent = secretsPresentForKdsRealtimeE2eStaging(input);
  const kdsGateEnabled = kdsV1GateEnabledForE2e(input);
  const e2eStepOutcome = input.e2eStepOutcome?.trim() || null;

  if (!secretsPresent) {
    return {
      status: "SKIPPED",
      reason:
        "Missing repository secrets E2E_LOGIN_EMAIL and/or E2E_LOGIN_PASSWORD. KDS staging smoke and realtime poll-fallback unit certs still apply.",
      secretsPresent: false,
      kdsGateEnabled,
      e2eStepOutcome,
    };
  }

  if (!kdsGateEnabled) {
    return {
      status: "SKIPPED",
      reason:
        "ENABLE_KDS_V1_CERTIFIED is not true (non-production). Set ENABLE_KDS_V1_CERTIFIED=true for staging KDS v1 browser smoke.",
      secretsPresent: true,
      kdsGateEnabled: false,
      e2eStepOutcome,
    };
  }

  if (e2eStepOutcome === "success") {
    return {
      status: "PASSED",
      reason: "Playwright KDS staging E2E completed successfully.",
      secretsPresent: true,
      kdsGateEnabled: true,
      e2eStepOutcome,
    };
  }

  if (e2eStepOutcome === "skipped" || e2eStepOutcome === null) {
    return {
      status: "SKIPPED",
      reason:
        "Auth secrets and KDS gate are configured but the browser E2E step did not run (workflow outcome skipped or unset). Staging smoke unit/integration certs still apply.",
      secretsPresent: true,
      kdsGateEnabled: true,
      e2eStepOutcome,
    };
  }

  return {
    status: "FAILED",
    reason: `KDS realtime staging browser E2E step outcome: ${e2eStepOutcome}.`,
    secretsPresent: true,
    kdsGateEnabled: true,
    e2eStepOutcome,
  };
}

export function buildKdsRealtimeE2eStagingCiSummary(
  input: ResolveKdsRealtimeE2eStagingCiInput,
  recordedAt: string = new Date().toISOString(),
): KdsRealtimeE2eStagingCiSummary {
  const resolved = resolveKdsRealtimeE2eStagingCiStatus(input);
  return {
    policyId: KDS_REALTIME_E2E_STAGING_SUMMARY_POLICY_ID,
    ...resolved,
    recordedAt,
    alwaysOnCertification: KDS_REALTIME_E2E_STAGING_ALWAYS_ON_SCRIPTS,
  };
}

export function exitCodeForKdsRealtimeE2eStagingCiStatus(
  status: KdsRealtimeE2eStagingCiStatus,
): number {
  return status === "FAILED" ? 1 : 0;
}

export const KDS_REALTIME_E2E_STAGING_ACCEPT_FORK_SKIP_WITHOUT_SECRETS = true as const;

export const KDS_REALTIME_E2E_STAGING_CI_SCRIPTS = [
  "test:ci:kds-realtime-e2e-staging-era11",
  "test:ci:kds-realtime-e2e-staging-era11:cert",
  "test:ci:kds-realtime-e2e-staging:policy",
] as const;

export const KDS_REALTIME_E2E_STAGING_UNIT_TESTS = [
  "tests/unit/kds-realtime-e2e-staging-era11-policy.test.ts",
  "tests/unit/kds-realtime-e2e-staging-era11-cert-live.test.ts",
  "tests/unit/kds-realtime-e2e-staging-summary-policy.test.ts",
] as const;

export const KDS_REALTIME_E2E_STAGING_CANONICAL_DOC_PATHS = [
  "docs/kds-staging-smoke-checklist.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/qa-master-test-plan.md",
] as const;

export const KDS_REALTIME_E2E_STAGING_CANONICAL_MARKERS = [
  KDS_REALTIME_E2E_STAGING_SUMMARY_POLICY_ID,
  KDS_REALTIME_E2E_STAGING_EXTENDS_POLICY_ID,
  KDS_REALTIME_E2E_STAGING_PLAYWRIGHT_SPEC,
  "kds-realtime-e2e-staging-summary",
  "PASSED",
  "SKIPPED",
  "FAILED",
] as const;
