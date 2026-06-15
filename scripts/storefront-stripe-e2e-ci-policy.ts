#!/usr/bin/env npx tsx
/**
 * Writes ci-artifacts/storefront-stripe-e2e-summary.json and prints PASSED / SKIPPED / FAILED.
 * Invoked at the end of the storefront-money-path CI job (always() step).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildStorefrontStripeE2eCiSummary,
  exitCodeForStorefrontStripeE2eCiStatus,
  type StorefrontStripeE2eCiSummary,
} from "@/lib/ci/storefront-stripe-e2e-policy";

const ARTIFACT_DIR = join(process.cwd(), "ci-artifacts");
const ARTIFACT_PATH = join(ARTIFACT_DIR, "storefront-stripe-e2e-summary.json");

function formatSummaryLine(summary: StorefrontStripeE2eCiSummary): string {
  return `Storefront Stripe E2E CI: ${summary.status} — ${summary.reason}`;
}

function main(): void {
  const summary = buildStorefrontStripeE2eCiSummary({
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    storefrontE2eStripe: process.env.STOREFRONT_E2E_STRIPE,
    e2eStepOutcome: process.env.STOREFRONT_STRIPE_E2E_STEP_OUTCOME,
  });

  mkdirSync(ARTIFACT_DIR, { recursive: true });
  writeFileSync(ARTIFACT_PATH, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(formatSummaryLine(summary));
  console.log(`Artifact: ${ARTIFACT_PATH}`);
  console.log(`Policy: ${summary.policyId}`);
  console.log(`Always-on tier-2: ${summary.alwaysOnCertification.join(", ")}`);

  process.exit(exitCodeForStorefrontStripeE2eCiStatus(summary.status));
}

main();
