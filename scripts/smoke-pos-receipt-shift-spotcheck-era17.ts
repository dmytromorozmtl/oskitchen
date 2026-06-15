/**
 * Era 17 POS receipt / shift spotcheck smoke — cert chain + summary artifact.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_POLICY_ID,
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_PROOF_STATUS,
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_SPOTCHECK_STEPS,
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_SUMMARY_ARTIFACT,
} from "../lib/pos/pos-receipt-shift-spotcheck-era17-policy";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function main() {
  console.log(`\n[smoke:pos-receipt-shift-spotcheck] ${POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_POLICY_ID}\n`);

  const certExitCode = runNpmScript("test:ci:pos-receipt-shift-spotcheck-era17:cert");
  const operatorEmail = process.env.POS_RECEIPT_SHIFT_SPOTCHECK_OPERATOR_EMAIL?.trim() || null;

  const summary = {
    version: POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_POLICY_ID,
    runAt: new Date().toISOString(),
    posReceiptShiftProofStatus:
      certExitCode === 0
        ? operatorEmail
          ? POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_PROOF_STATUS
          : "awaiting_operator_spotcheck_execution"
        : "proof_failed",
    operatorEmail,
    stagingUrl: process.env.POS_RECEIPT_SHIFT_SPOTCHECK_STAGING_URL?.trim() || null,
    certPassed: certExitCode === 0,
    spotcheckSteps: POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_SPOTCHECK_STEPS,
  };

  const artifactPath = join(process.cwd(), POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`Proof: ${summary.posReceiptShiftProofStatus}`);
  console.log(`Summary artifact: ${POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_SUMMARY_ARTIFACT}\n`);
  console.log("See docs/pos-receipt-shift-spotcheck-era17.md\n");

  if (certExitCode !== 0) process.exit(certExitCode);
  if (!operatorEmail) {
    console.log("SKIPPED WITH REASON — operator spotcheck not attested; cert passed.");
  }
  process.exit(0);
}

main();
