/**
 * Era 17 channel pilot setup wizard smoke — cert chain + summary artifact.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  CHANNEL_PILOT_SETUP_WIZARD_ERA17_POLICY_ID,
  CHANNEL_PILOT_SETUP_WIZARD_ERA17_SUMMARY_ARTIFACT,
} from "../lib/integrations/channel-pilot-setup-wizard-era17-policy";
import { pilotSetupStepReductionPercent } from "../lib/integrations/channel-pilot-setup-wizard-steps";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function main() {
  console.log(`\n[smoke:channel-pilot-setup-wizard] ${CHANNEL_PILOT_SETUP_WIZARD_ERA17_POLICY_ID}\n`);

  const certExitCode = runNpmScript("test:ci:channel-pilot-setup-wizard-era17:cert");
  const operatorEmail = process.env.CHANNEL_PILOT_SETUP_OPERATOR_EMAIL?.trim() || null;

  const summary = {
    version: CHANNEL_PILOT_SETUP_WIZARD_ERA17_POLICY_ID,
    runAt: new Date().toISOString(),
    certPassed: certExitCode === 0,
    stepReductionPercent: pilotSetupStepReductionPercent(),
    proofStatus:
      certExitCode === 0
        ? operatorEmail
          ? "proof_passed"
          : "pilot_setup_wizard_ready_awaiting_operator_spotcheck"
        : "proof_failed",
    operatorEmail,
    readinessDecision: certExitCode === 0 ? "READY" : "NOT_READY",
  };

  const artifactPath = join(process.cwd(), CHANNEL_PILOT_SETUP_WIZARD_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`Proof: ${summary.proofStatus}`);
  console.log(`Summary artifact: ${CHANNEL_PILOT_SETUP_WIZARD_ERA17_SUMMARY_ARTIFACT}\n`);

  if (certExitCode !== 0) process.exit(certExitCode);
  if (!operatorEmail) {
    console.log("SKIPPED WITH REASON — operator spot check not attested; cert passed.");
  }
  process.exit(0);
}

main();
