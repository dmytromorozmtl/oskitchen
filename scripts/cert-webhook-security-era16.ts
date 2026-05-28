/**
 * Era 16 webhook security matrix cert script.
 * Writes artifacts/webhook-security-matrix-summary.json for operator review.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  WEBHOOK_SECURITY_ERA16_POLICY_ID,
  WEBHOOK_SECURITY_ERA16_COMMERCE_ROUTES,
  WEBHOOK_SECURITY_ERA16_SUMMARY_ARTIFACT,
} from "../lib/security/webhook-security-era16-policy";
import {
  buildWebhookSecurityMatrix,
  buildWebhookSecurityMatrixSummary,
  formatWebhookSecurityMatrixLine,
  validateWebhookSecurityMatrix,
} from "../lib/security/webhook-security-matrix";

function main() {
  const validation = validateWebhookSecurityMatrix();
  const summary = buildWebhookSecurityMatrixSummary(
    WEBHOOK_SECURITY_ERA16_POLICY_ID,
    validation.entries,
  );

  const artifactPath = join(process.cwd(), WEBHOOK_SECURITY_ERA16_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`\nWebhook security matrix (${WEBHOOK_SECURITY_ERA16_POLICY_ID})\n`);
  console.log(`Routes: ${summary.totalRoutes} (expected ${summary.expectedRouteCount})`);
  console.log(`P0: ${summary.byRiskTier.P0} | P1: ${summary.byRiskTier.P1} | P2: ${summary.byRiskTier.P2} | P3: ${summary.byRiskTier.P3}`);
  console.log(`Commerce with replay: ${summary.commerceRoutesWithReplay}/${WEBHOOK_SECURITY_ERA16_COMMERCE_ROUTES.length}`);

  if (summary.p0p1MissingReplay.length > 0) {
    console.log("\nP0/P1 routes without replay classification:");
    for (const entry of summary.p0p1MissingReplay) {
      console.log(`  - ${formatWebhookSecurityMatrixLine(entry)}`);
    }
  }

  if (summary.highRiskNextActions.length > 0) {
    console.log("\nHigh-risk next actions:");
    for (const item of summary.highRiskNextActions) {
      console.log(`  - ${item.apiPath}: ${item.nextAction}`);
    }
  }

  console.log(`\nSummary artifact: ${WEBHOOK_SECURITY_ERA16_SUMMARY_ARTIFACT}\n`);

  if (!validation.ok) {
    console.error("Matrix validation failed:");
    for (const error of validation.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  const matrix = buildWebhookSecurityMatrix();
  if (process.argv.includes("--verbose")) {
    console.log("Full matrix:");
    for (const entry of matrix) {
      console.log(`  ${formatWebhookSecurityMatrixLine(entry)}`);
    }
  }
}

main();
