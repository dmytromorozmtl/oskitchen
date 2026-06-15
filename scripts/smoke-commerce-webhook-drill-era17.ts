/**
 * Era 17 commerce webhook incident drill orchestrator (Cycle 21).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  COMMERCE_WEBHOOK_DRILL_ERA17_CYCLE_RUNBOOK_STEPS,
  COMMERCE_WEBHOOK_DRILL_ERA17_NPM_SCRIPT,
  COMMERCE_WEBHOOK_DRILL_ERA17_POLICY_ID,
  COMMERCE_WEBHOOK_DRILL_ERA17_SUMMARY_ARTIFACT,
} from "../lib/security/commerce-webhook-drill-era17-policy";
import {
  buildCommerceWebhookDrillInputFromEnv,
  buildCommerceWebhookDrillSummary,
  formatCommerceWebhookDrillReportLines,
} from "../lib/security/commerce-webhook-drill-summary";

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function runCertChain(): number {
  const result = spawnSync("npm", ["run", "test:ci:commerce-webhook-drill-era17:cert"], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function printRunbook(): void {
  console.log(`\nCommerce webhook incident drill (${COMMERCE_WEBHOOK_DRILL_ERA17_POLICY_ID})\n`);
  for (const [index, step] of COMMERCE_WEBHOOK_DRILL_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/commerce-webhook-incident-drill-era17.md\n");
}

function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
Era 17 commerce webhook incident drill

  (default)         Record drill from env; run cert chain; write summary artifact
  --checklist-only  Print runbook steps
  --template-only   Write template with all steps SKIPPED (no cert run)

Env:
  COMMERCE_WEBHOOK_DRILL_MODE=tabletop|staging
  COMMERCE_WEBHOOK_DRILL_OPERATOR_EMAIL
  COMMERCE_WEBHOOK_DRILL_STAGING_URL
  COMMERCE_WEBHOOK_DRILL_INCIDENT_PROVIDER=stripe|woocommerce|shopify
  COMMERCE_WEBHOOK_DRILL_INCIDENT_SUMMARY
  COMMERCE_WEBHOOK_DRILL_STEP_<1-6>_STATUS=PASSED|FAILED
  COMMERCE_WEBHOOK_DRILL_POSTMORTEM
`);
    process.exit(0);
  }

  if (hasFlag("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(
    `\n[${COMMERCE_WEBHOOK_DRILL_ERA17_NPM_SCRIPT}] ${COMMERCE_WEBHOOK_DRILL_ERA17_POLICY_ID}\n`,
  );

  let certExitCode = 0;
  if (!hasFlag("--template-only")) {
    certExitCode = runCertChain();
    if (certExitCode !== 0) {
      console.error("\nCert chain FAILED — fix before recording drill proof.\n");
      process.exit(certExitCode);
    }
  }

  const input = hasFlag("--template-only")
    ? { drillMode: "unset" as const }
    : buildCommerceWebhookDrillInputFromEnv();

  const summary = buildCommerceWebhookDrillSummary(input);
  const artifactPath = join(process.cwd(), COMMERCE_WEBHOOK_DRILL_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(
    artifactPath,
    `${JSON.stringify({ ...summary, certExitCode }, null, 2)}\n`,
    "utf8",
  );

  for (const line of formatCommerceWebhookDrillReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${COMMERCE_WEBHOOK_DRILL_ERA17_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.commerceWebhookProofStatus === "proof_failed") {
    process.exit(1);
  }
  if (summary.commerceWebhookProofStatus === "proof_skipped_missing_prerequisites") {
    console.log(
      "SKIPPED WITH REASON — commerce webhook drill not executed; template written for ops tabletop.\n",
    );
  }
}

main();
