/**
 * Summary helpers for 18 LIVE integration staging smoke fleet.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

import { logger } from "@/lib/logger";

import {
  LIVE_INTEGRATIONS_STAGING_SMOKE_EXPECTED_COUNT,
  LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET,
  LIVE_INTEGRATIONS_STAGING_SMOKE_INTEGRATION_HEALTH_PATH,
  LIVE_INTEGRATIONS_STAGING_SMOKE_POLICY_ID,
  LIVE_INTEGRATIONS_STAGING_SHARED_ENV_KEYS,
} from "@/lib/integrations/live-integrations-staging-smoke-policy";

export const LIVE_INTEGRATIONS_STAGING_SMOKE_SUMMARY_VERSION =
  LIVE_INTEGRATIONS_STAGING_SMOKE_POLICY_ID;

export type LiveIntegrationsStagingSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type LiveIntegrationsStagingSmokeStep = {
  integrationId: string;
  name: string;
  status: LiveIntegrationsStagingSmokeStepStatus;
  smokeScript: string | null;
  reason?: string;
  missingEnvVars?: string[];
};

export type LiveIntegrationsStagingSmokeOverall = "PASSED" | "FAILED" | "SKIPPED";

export type LiveIntegrationsStagingSmokeSummary = {
  version: typeof LIVE_INTEGRATIONS_STAGING_SMOKE_SUMMARY_VERSION;
  runAt: string;
  overall: LiveIntegrationsStagingSmokeOverall;
  stagingBaseUrl: string | null;
  missingSharedEnvVars: string[];
  passedCount: number;
  skippedCount: number;
  failedCount: number;
  expectedCount: number;
  steps: LiveIntegrationsStagingSmokeStep[];
  honestyNote: string;
};

export type LiveIntegrationsStagingPrerequisiteInput = {
  stagingBaseUrl?: string | null;
  databaseUrl?: string | null;
  encryptionKey?: string | null;
  connectionId?: string | null;
  ownerEmail?: string | null;
};

export function listMissingLiveIntegrationsStagingSharedEnvVars(
  input: LiveIntegrationsStagingPrerequisiteInput,
): string[] {
  const missing: string[] = [];
  if (!input.stagingBaseUrl?.trim()) missing.push("E2E_STAGING_BASE_URL");
  if (!input.databaseUrl?.trim()) missing.push("DATABASE_URL");
  const hasTenant =
    Boolean(input.connectionId?.trim()) || Boolean(input.ownerEmail?.trim());
  if (!hasTenant) {
    missing.push("CHANNEL_SMOKE_CONNECTION_ID or CHANNEL_SMOKE_OWNER_EMAIL");
  }
  return missing;
}

export function formatLiveIntegrationsStagingStepLine(
  step: LiveIntegrationsStagingSmokeStep,
): string {
  if (step.status === "SKIPPED") {
    return `[SKIPPED WITH REASON] ${step.name}: ${step.reason ?? "skipped"}`;
  }
  if (step.status === "FAILED") {
    return `[FAILED] ${step.name}${step.reason ? `: ${step.reason}` : ""}`;
  }
  return `[PASSED] ${step.name}${step.reason ? `: ${step.reason}` : ""}`;
}

export function resolveLiveIntegrationsStagingSmokeOverall(
  steps: readonly LiveIntegrationsStagingSmokeStep[],
): LiveIntegrationsStagingSmokeOverall {
  if (steps.some((step) => step.status === "FAILED")) return "FAILED";
  const actionable = steps.filter((step) => step.status !== "SKIPPED");
  if (actionable.length === 0) return "SKIPPED";
  if (actionable.every((step) => step.status === "PASSED")) return "PASSED";
  return "FAILED";
}

export function buildLiveIntegrationsStagingSmokeSummary(
  steps: readonly LiveIntegrationsStagingSmokeStep[],
  input?: {
    stagingBaseUrl?: string | null;
    missingSharedEnvVars?: readonly string[];
  },
  runAt: Date = new Date(),
): LiveIntegrationsStagingSmokeSummary {
  const passedCount = steps.filter((step) => step.status === "PASSED").length;
  const skippedCount = steps.filter((step) => step.status === "SKIPPED").length;
  const failedCount = steps.filter((step) => step.status === "FAILED").length;
  const missingSharedEnvVars = [...(input?.missingSharedEnvVars ?? [])];

  let honestyNote =
    "Fleet runs per-provider live smokes against staging; SKIPPED when merchant credentials are not configured.";
  if (missingSharedEnvVars.length > 0) {
    honestyNote = `Shared staging env incomplete (${missingSharedEnvVars.join(", ")}) — merchant smokes will SKIPPED until vault is configured.`;
  } else if (passedCount === 0 && failedCount === 0) {
    honestyNote =
      "No merchant credentials configured — all provider smokes SKIPPED. Configure `.env.smoke.local` for live proof.";
  } else if (passedCount > 0 && skippedCount > 0) {
    honestyNote = `${passedCount} provider(s) proved live on staging; ${skippedCount} SKIPPED pending merchant credentials.`;
  }

  return {
    version: LIVE_INTEGRATIONS_STAGING_SMOKE_SUMMARY_VERSION,
    runAt: runAt.toISOString(),
    overall: resolveLiveIntegrationsStagingSmokeOverall(steps),
    stagingBaseUrl: input?.stagingBaseUrl?.trim() || null,
    missingSharedEnvVars,
    passedCount,
    skippedCount,
    failedCount,
    expectedCount: LIVE_INTEGRATIONS_STAGING_SMOKE_EXPECTED_COUNT,
    steps: [...steps],
    honestyNote,
  };
}

export function formatLiveIntegrationsStagingSmokeReportLines(
  summary: LiveIntegrationsStagingSmokeSummary,
): string[] {
  return [
    `LIVE integrations staging smoke (${summary.version}) — overall: ${summary.overall}`,
    `Run at: ${summary.runAt}`,
    `Staging: ${summary.stagingBaseUrl ?? "not set"}`,
    `Results: ${summary.passedCount} passed, ${summary.skippedCount} skipped, ${summary.failedCount} failed (expected ${summary.expectedCount})`,
    summary.missingSharedEnvVars.length > 0
      ? `Missing shared env: ${summary.missingSharedEnvVars.join(", ")}`
      : "Missing shared env: none",
    summary.honestyNote,
    "",
    ...summary.steps.map((step) => formatLiveIntegrationsStagingStepLine(step)),
  ];
}

export function printLiveIntegrationsStagingSmokeSummary(
  summary: LiveIntegrationsStagingSmokeSummary,
): void {
  logger.cli(`\nLIVE integrations staging smoke (${summary.version})`);
  logger.cli(`Overall: ${summary.overall}`);
  logger.cli(
    `Passed: ${summary.passedCount} | Skipped: ${summary.skippedCount} | Failed: ${summary.failedCount}`,
  );
  logger.cli(summary.honestyNote);
  for (const step of summary.steps) {
    logger.cli(`  ${formatLiveIntegrationsStagingStepLine(step)}`);
  }
  logger.cli("");
}

export function auditLiveIntegrationsStagingSmokeWiring(root: string): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  if (LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET.length !== LIVE_INTEGRATIONS_STAGING_SMOKE_EXPECTED_COUNT) {
    failures.push(
      `fleet size ${LIVE_INTEGRATIONS_STAGING_SMOKE_FLEET.length} !== expected ${LIVE_INTEGRATIONS_STAGING_SMOKE_EXPECTED_COUNT}`,
    );
  }

  const orchestratorPath = join(root, "scripts/smoke-live-integrations-staging.ts");
  if (!existsSync(orchestratorPath)) {
    failures.push("missing scripts/smoke-live-integrations-staging.ts");
  }

  for (const key of LIVE_INTEGRATIONS_STAGING_SHARED_ENV_KEYS) {
    if (!key.trim()) failures.push("empty shared env key");
  }

  if (!LIVE_INTEGRATIONS_STAGING_SMOKE_INTEGRATION_HEALTH_PATH.startsWith("/dashboard/")) {
    failures.push("integration health path must be under /dashboard/");
  }

  return { ok: failures.length === 0, failures };
}
