#!/usr/bin/env npx tsx
/**
 * Writes ci-artifacts/kds-realtime-e2e-staging-summary.json and prints PASSED / SKIPPED / FAILED.
 * Invoked manually or from staging workflows — not from default `ci.yml` quality job.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildKdsRealtimeE2eStagingCiSummary,
  exitCodeForKdsRealtimeE2eStagingCiStatus,
  KDS_REALTIME_E2E_STAGING_SUMMARY_ARTIFACT,
  type KdsRealtimeE2eStagingCiSummary,
} from "@/lib/ci/kds-realtime-e2e-staging-summary-policy";

const ARTIFACT_DIR = join(process.cwd(), "ci-artifacts");
const ARTIFACT_PATH = join(ARTIFACT_DIR, "kds-realtime-e2e-staging-summary.json");

function formatSummaryLine(summary: KdsRealtimeE2eStagingCiSummary): string {
  return `KDS realtime staging E2E CI: ${summary.status} — ${summary.reason}`;
}

function main(): void {
  const summary = buildKdsRealtimeE2eStagingCiSummary({
    e2eLoginEmail: process.env.E2E_LOGIN_EMAIL,
    e2eLoginPassword: process.env.E2E_LOGIN_PASSWORD,
    enableKdsV1Certified: process.env.ENABLE_KDS_V1_CERTIFIED,
    nodeEnv: process.env.NODE_ENV,
    e2eStepOutcome: process.env.KDS_REALTIME_E2E_STEP_OUTCOME,
  });

  mkdirSync(ARTIFACT_DIR, { recursive: true });
  writeFileSync(ARTIFACT_PATH, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(formatSummaryLine(summary));
  console.log(`Artifact: ${ARTIFACT_PATH}`);
  console.log(`Policy: ${summary.policyId}`);
  console.log(`Always-on KDS certs: ${summary.alwaysOnCertification.join(", ")}`);
  if (ARTIFACT_PATH !== join(process.cwd(), KDS_REALTIME_E2E_STAGING_SUMMARY_ARTIFACT)) {
    throw new Error("Artifact path drift from policy");
  }

  process.exit(exitCodeForKdsRealtimeE2eStagingCiStatus(summary.status));
}

main();
