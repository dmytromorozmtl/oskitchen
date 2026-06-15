/**
 * Era 17 permission denied UX smoke — cert chain + summary artifact.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  PERMISSION_DENIED_UX_ERA17_POLICY_ID,
  PERMISSION_DENIED_UX_ERA17_SUMMARY_ARTIFACT,
} from "../lib/ux/permission-denied-era17-policy";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function main() {
  console.log(`\n[smoke:permission-denied-ux] ${PERMISSION_DENIED_UX_ERA17_POLICY_ID}\n`);

  const certExitCode = runNpmScript("test:ci:permission-denied-ux-era17:cert");
  const operatorEmail = process.env.PERMISSION_DENIED_UX_OPERATOR_EMAIL?.trim() || null;

  const summary = {
    version: PERMISSION_DENIED_UX_ERA17_POLICY_ID,
    runAt: new Date().toISOString(),
    certPassed: certExitCode === 0,
    proofStatus:
      certExitCode === 0
        ? operatorEmail
          ? "proof_passed"
          : "ux_consistent_awaiting_operator_spotcheck"
        : "proof_failed",
    operatorEmail,
    readinessDecision: certExitCode === 0 ? "READY" : "NOT_READY",
  };

  const artifactPath = join(process.cwd(), PERMISSION_DENIED_UX_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`Proof: ${summary.proofStatus}`);
  console.log(`Summary artifact: ${PERMISSION_DENIED_UX_ERA17_SUMMARY_ARTIFACT}\n`);

  if (certExitCode !== 0) process.exit(certExitCode);
  if (!operatorEmail) {
    console.log("SKIPPED WITH REASON — operator spot check not attested; cert passed.");
  }
  process.exit(0);
}

main();
