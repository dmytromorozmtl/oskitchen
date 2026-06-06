/**
 * Sentry production smoke summary — wiring audit (Era 143).
 */

import {
  SENTRY_PRODUCTION_ERA143_CAPABILITIES,
  SENTRY_PRODUCTION_ERA143_POLICY_ID,
  SENTRY_PRODUCTION_ERA143_REQUIRED_ENV_VARS,
} from "@/lib/observability/sentry-production-era143-policy";
import {
  auditSentryProductionWiring,
  listMissingSentryProductionEnvVars,
} from "@/lib/observability/sentry-production-summary";

export const SENTRY_PRODUCTION_ERA143_SMOKE_SUMMARY_VERSION = SENTRY_PRODUCTION_ERA143_POLICY_ID;

export type SentryProductionEra143SmokeOverall = "PASSED" | "FAILED" | "SKIPPED";

export type SentryProductionEra143ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type SentryProductionEra143SmokeStep = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type SentryProductionEra143SmokeSummary = {
  version: typeof SENTRY_PRODUCTION_ERA143_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: SentryProductionEra143SmokeOverall;
  proofStatus: SentryProductionEra143ProofStatus;
  wiringCertPassed: boolean;
  dsnConfigured: boolean;
  capabilities: readonly string[];
  steps: SentryProductionEra143SmokeStep[];
  honestyNote: string;
};

function looksLikeSentryDsn(value: string | undefined): boolean {
  if (!value?.trim()) return false;
  return /^https:\/\/[^@]+@[^/]+\.ingest\.(sentry\.io|us\.sentry\.io|de\.sentry\.io)\/\d+/i.test(
    value.trim(),
  );
}

export function auditSentryProductionEra143SmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditSentryProductionWiring(root);
}

export function resolveSentryProductionEra143ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): SentryProductionEra143ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildSentryProductionEra143SmokeSummary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  env?: NodeJS.ProcessEnv;
  commitSha?: string | null;
  runAt?: Date;
}): SentryProductionEra143SmokeSummary {
  const env = input.env ?? process.env;
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const missingEnvVars = listMissingSentryProductionEnvVars(env);
  const dsnConfigured = missingEnvVars.length === 0;
  const publicDsnConfigured = looksLikeSentryDsn(env.NEXT_PUBLIC_SENTRY_DSN);

  const proofStatus = resolveSentryProductionEra143ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: SentryProductionEra143SmokeOverall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: SentryProductionEra143SmokeStep[] = [
    {
      id: "wiring_audit",
      label: "Sentry.init() + instrumentation + health probe wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 143 Sentry production cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "server_dsn",
      label: "SENTRY_DSN configured (Vercel Production)",
      status: dsnConfigured ? "PASSED" : "SKIPPED",
      reason: dsnConfigured
        ? "DSN present"
        : `Missing ${SENTRY_PRODUCTION_ERA143_REQUIRED_ENV_VARS.join(", ")} — run npm run sentry:production:activate`,
    },
    {
      id: "public_dsn",
      label: "NEXT_PUBLIC_SENTRY_DSN (browser SDK)",
      status: publicDsnConfigured ? "PASSED" : "SKIPPED",
      reason: publicDsnConfigured
        ? "Public DSN present"
        : "Optional — mirror with --mirror-public-dsn",
    },
  ];

  return {
    version: SENTRY_PRODUCTION_ERA143_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    dsnConfigured,
    capabilities: SENTRY_PRODUCTION_ERA143_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Sentry SDK wiring — live proof requires SENTRY_DSN on Vercel Production.",
  };
}

export function formatSentryProductionEra143SmokeReportLines(
  summary: SentryProductionEra143SmokeSummary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `DSN configured: ${summary.dsnConfigured}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
