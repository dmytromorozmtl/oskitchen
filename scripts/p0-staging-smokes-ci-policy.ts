#!/usr/bin/env npx tsx
/**
 * Writes ci-artifacts/p0-staging-smokes-summary.json and prints PASSED / SKIPPED / FAILED.
 * Invoked at the end of the p0-staging-smokes CI job (always() step).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildP0StagingSmokesCiSummary,
  exitCodeForP0StagingSmokesCiStatus,
  type P0StagingSmokesCiSummary,
} from "@/lib/ci/p0-staging-smokes-ci-policy";

const ARTIFACT_DIR = join(process.cwd(), "ci-artifacts");
const ARTIFACT_PATH = join(ARTIFACT_DIR, "p0-staging-smokes-summary.json");

function formatSummaryLine(summary: P0StagingSmokesCiSummary): string {
  return `P0 staging smokes CI: ${summary.status} — ${summary.reason}`;
}

function main(): void {
  const summary = buildP0StagingSmokesCiSummary({
    env: process.env,
    smokeStepOutcome: process.env.P0_STAGING_SMOKES_STEP_OUTCOME,
  });

  mkdirSync(ARTIFACT_DIR, { recursive: true });
  writeFileSync(ARTIFACT_PATH, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(formatSummaryLine(summary));
  console.log(`Artifact: ${ARTIFACT_PATH}`);
  console.log(`Policy: ${summary.policyId}`);
  console.log(`Always-on: ${summary.alwaysOnCertification.join(", ")}`);
  console.log(`Ops checklist: ${summary.opsChecklistDoc}`);

  process.exit(exitCodeForP0StagingSmokesCiStatus(summary.status));
}

main();
