/**
 * Sentry production smoke summary — wiring audit + DSN readiness (Era 70).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SENTRY_PRODUCTION_ERA70_POLICY_ID,
  SENTRY_PRODUCTION_ERA70_RECOMMENDED_ENV_VARS,
  SENTRY_PRODUCTION_ERA70_REQUIRED_ENV_VARS,
  SENTRY_PRODUCTION_ERA70_WIRING_PATHS,
} from "@/lib/observability/sentry-production-era70-policy";

export const SENTRY_PRODUCTION_SUMMARY_VERSION = SENTRY_PRODUCTION_ERA70_POLICY_ID;

export type SentryProductionSmokeOverall = "PASSED" | "FAILED" | "SKIPPED";

export type SentryProductionProofStatus =
  | "proof_passed"
  | "proof_skipped_awaiting_dsn"
  | "proof_failed_wiring"
  | "proof_failed_cert";

export type SentryProductionSmokeStep = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type SentryProductionSmokeSummary = {
  version: typeof SENTRY_PRODUCTION_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: SentryProductionSmokeOverall;
  proofStatus: SentryProductionProofStatus;
  wiringCertPassed: boolean;
  dsnConfigured: boolean;
  publicDsnConfigured: boolean;
  missingEnvVars: string[];
  steps: SentryProductionSmokeStep[];
};

function looksLikeSentryDsn(value: string | undefined): boolean {
  if (!value?.trim()) return false;
  return /^https:\/\/[^@]+@[^/]+\.ingest\.(sentry\.io|us\.sentry\.io|de\.sentry\.io)\/\d+/i.test(
    value.trim(),
  );
}

export function listMissingSentryProductionEnvVars(
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  return SENTRY_PRODUCTION_ERA70_REQUIRED_ENV_VARS.filter(
    (key) => !looksLikeSentryDsn(env[key]),
  );
}

export function auditSentryProductionWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of SENTRY_PRODUCTION_ERA70_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (/^sentry\..*\.config\.ts$/.test(rel) && !src.includes("Sentry.init")) {
      failures.push(`${rel} missing Sentry.init`);
    }
    if (rel === "scripts/push-vercel-production-sentry.ts" && !src.includes("SENTRY_DSN")) {
      failures.push("push-vercel-production-sentry.ts missing SENTRY_DSN handling");
    }
    if (rel === "instrumentation.ts" && !src.includes("sentry.server.config")) {
      failures.push("instrumentation.ts missing sentry.server.config import");
    }
    if (rel === "instrumentation-client.ts" && !src.includes("Sentry.init")) {
      failures.push("instrumentation-client.ts missing Sentry.init");
    }
    if (rel === "services/observability/error-reporting-service.ts" && !src.includes("captureErrorSafe")) {
      failures.push("error-reporting-service.ts missing captureErrorSafe");
    }
    if (rel === "app/api/health/route.ts" && !src.includes("sentryServer")) {
      failures.push("health route missing sentryServer check");
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveSentryProductionProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  dsnConfigured: boolean;
}): SentryProductionProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  if (!input.dsnConfigured) return "proof_skipped_awaiting_dsn";
  return "proof_passed";
}

export function resolveSentryProductionOverall(
  proofStatus: SentryProductionProofStatus,
): SentryProductionSmokeOverall {
  if (proofStatus === "proof_passed") return "PASSED";
  if (proofStatus === "proof_skipped_awaiting_dsn") return "SKIPPED";
  return "FAILED";
}

export function buildSentryProductionSmokeSummary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  env?: NodeJS.ProcessEnv;
  commitSha?: string | null;
  runAt?: Date;
}): SentryProductionSmokeSummary {
  const env = input.env ?? process.env;
  const wiringFailures = [...(input.wiringFailures ?? [])];
  const wiringOk = wiringFailures.length === 0;
  const missingEnvVars = listMissingSentryProductionEnvVars(env);
  const dsnConfigured = missingEnvVars.length === 0;
  const publicDsnConfigured = looksLikeSentryDsn(env.NEXT_PUBLIC_SENTRY_DSN);

  const proofStatus = resolveSentryProductionProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    dsnConfigured,
  });
  const overall = resolveSentryProductionOverall(proofStatus);

  const steps: SentryProductionSmokeStep[] = [
    {
      id: "wiring_cert",
      label: "Sentry integration cert (test:ci:sentry-production-era70:cert)",
      status: input.certPassed ? "PASSED" : "FAILED",
      reason: input.certPassed ? undefined : "exit non-zero",
    },
    {
      id: "static_wiring_audit",
      label: "Static Sentry production wiring audit",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "server_dsn",
      label: "SENTRY_DSN configured (Vercel Production or local shell)",
      status: dsnConfigured ? "PASSED" : "SKIPPED",
      reason: dsnConfigured
        ? "DSN present"
        : `Missing ${SENTRY_PRODUCTION_ERA70_REQUIRED_ENV_VARS.join(", ")} — run npm run sentry:production:activate`,
    },
    {
      id: "public_dsn",
      label: "NEXT_PUBLIC_SENTRY_DSN (browser SDK)",
      status: publicDsnConfigured ? "PASSED" : "SKIPPED",
      reason: publicDsnConfigured
        ? "Public DSN present"
        : `Optional — set for Replay/Feedback or use --mirror-public-dsn`,
    },
  ];

  for (const key of SENTRY_PRODUCTION_ERA70_RECOMMENDED_ENV_VARS) {
    if (SENTRY_PRODUCTION_ERA70_REQUIRED_ENV_VARS.includes(key as never)) continue;
    if (!env[key]?.trim()) continue;
    steps.push({
      id: `env_${key.toLowerCase()}`,
      label: `${key} set`,
      status: "PASSED",
    });
  }

  return {
    version: SENTRY_PRODUCTION_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha?.trim() || null,
    overall,
    proofStatus,
    wiringCertPassed: input.certPassed && wiringOk,
    dsnConfigured,
    publicDsnConfigured,
    missingEnvVars,
    steps,
  };
}

export function formatSentryProductionSmokeReportLines(
  summary: SentryProductionSmokeSummary,
): string[] {
  return [
    `Sentry production smoke (${summary.version}) — overall: ${summary.overall}`,
    `proofStatus: ${summary.proofStatus}`,
    `wiringCertPassed: ${summary.wiringCertPassed}`,
    `dsnConfigured: ${summary.dsnConfigured}`,
    `publicDsnConfigured: ${summary.publicDsnConfigured}`,
    summary.missingEnvVars.length
      ? `missingEnvVars: ${summary.missingEnvVars.join(", ")}`
      : "missingEnvVars: none",
    "",
    ...summary.steps.map((step) => {
      if (step.status === "SKIPPED") {
        return `[SKIPPED WITH REASON] ${step.label}: ${step.reason ?? "skipped"}`;
      }
      if (step.status === "FAILED") {
        return `[FAILED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
      }
      return `[PASSED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
    }),
  ];
}
