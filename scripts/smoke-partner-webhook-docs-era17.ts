/**
 * Era 17 partner webhook docs smoke — cert chain + summary artifact.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  PARTNER_WEBHOOK_ERA17_POLICY_ID,
  PARTNER_WEBHOOK_ERA17_SUMMARY_ARTIFACT,
} from "../lib/developer/partner-webhook-era17-policy";
import { PARTNER_WEBHOOK_CHECKLIST } from "../lib/developer/partner-webhook-pack";
import {
  buildPartnerWebhookConfidenceArtifact,
  buildPartnerWebhookSummary,
  formatPartnerWebhookSummaryLines,
  parsePartnerWebhookEnv,
} from "../lib/developer/partner-webhook-summary";

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
Era 17 partner webhook integration docs smoke

  (default)         Run cert chain; write summary artifact
  --template-only   Write summary without cert run
  --checklist-only  Print partner checklist from pack module

Env:
  PARTNER_WEBHOOK_ATTESTATION_EMAIL   Optional partner onboarding attestation
  PARTNER_WEBHOOK_ATTESTATION_NOTES   Optional notes for artifact
`);
    process.exit(0);
  }

  if (hasFlag("--checklist-only")) {
    console.log(`\nPartner webhook checklist (${PARTNER_WEBHOOK_ERA17_POLICY_ID})\n`);
    for (const [index, item] of PARTNER_WEBHOOK_CHECKLIST.entries()) {
      console.log(`${index + 1}. [${item.id}] ${item.task}`);
      console.log(`   Verify: ${item.verifyHow}\n`);
    }
    console.log("See docs/partner-webhook-integration-era17.md\n");
    process.exit(0);
  }

  console.log(`\n[smoke:partner-webhook-docs] ${PARTNER_WEBHOOK_ERA17_POLICY_ID}\n`);

  const templateOnly = hasFlag("--template-only");
  let certExitCode = 0;
  if (!templateOnly) {
    certExitCode = runNpmScript("test:ci:partner-webhook-docs-era17:cert");
    if (certExitCode !== 0) {
      console.error("\nCert chain FAILED — fix before recording partner webhook proof.\n");
      process.exit(certExitCode);
    }
  }

  const envInput = parsePartnerWebhookEnv();
  const summary = buildPartnerWebhookSummary({
    ...envInput,
    certPassed: certExitCode === 0,
  });
  const confidence = buildPartnerWebhookConfidenceArtifact({
    ...envInput,
    certPassed: certExitCode === 0,
  });

  const artifactPath = join(process.cwd(), PARTNER_WEBHOOK_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(
    artifactPath,
    `${JSON.stringify({ ...summary, confidence }, null, 2)}\n`,
    "utf8",
  );

  for (const line of formatPartnerWebhookSummaryLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${PARTNER_WEBHOOK_ERA17_SUMMARY_ARTIFACT}\n`);

  if (summary.partnerWebhookProofStatus === "proof_failed") {
    process.exit(1);
  }
}

main();
