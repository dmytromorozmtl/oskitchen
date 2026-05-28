#!/usr/bin/env npx tsx
/**
 * Writes ci-artifacts/pos-browser-e2e-summary.json and prints PASSED / SKIPPED / FAILED.
 * Invoked at the end of the pos-money-path CI job (always() step).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildPosBrowserE2eCiSummary,
  exitCodeForPosBrowserE2eCiStatus,
  type PosBrowserE2eCiSummary,
} from "@/lib/ci/pos-browser-e2e-policy";

const ARTIFACT_DIR = join(process.cwd(), "ci-artifacts");
const ARTIFACT_PATH = join(ARTIFACT_DIR, "pos-browser-e2e-summary.json");

function formatSummaryLine(summary: PosBrowserE2eCiSummary): string {
  return `POS browser E2E CI: ${summary.status} — ${summary.reason}`;
}

function main(): void {
  const summary = buildPosBrowserE2eCiSummary({
    e2eLoginEmail: process.env.E2E_LOGIN_EMAIL,
    e2eLoginPassword: process.env.E2E_LOGIN_PASSWORD,
    e2eStepOutcome: process.env.POS_BROWSER_E2E_STEP_OUTCOME,
  });

  mkdirSync(ARTIFACT_DIR, { recursive: true });
  writeFileSync(ARTIFACT_PATH, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(formatSummaryLine(summary));
  console.log(`Artifact: ${ARTIFACT_PATH}`);
  console.log(`Policy: ${summary.policyId}`);
  console.log(`Always-on tier-2b: ${summary.alwaysOnCertification.join(", ")}`);

  process.exit(exitCodeForPosBrowserE2eCiStatus(summary.status));
}

main();
