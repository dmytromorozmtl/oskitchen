/**
 * Era 17 costing pilot spot check smoke — cert chain + summary artifact.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  COSTING_PILOT_SPOTCHECK_ERA17_POLICY_ID,
  COSTING_PILOT_SPOTCHECK_ERA17_SUMMARY_ARTIFACT,
} from "../lib/costing/costing-pilot-spotcheck-era17-policy";
import {
  buildCostingPilotSpotcheckSummary,
  formatCostingPilotSpotcheckReportLines,
  parseCostingPilotSpotcheckEnv,
} from "../lib/costing/costing-pilot-spotcheck-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function main() {
  console.log(`\n[smoke:costing-pilot-spotcheck] ${COSTING_PILOT_SPOTCHECK_ERA17_POLICY_ID}\n`);

  const certExitCode = runNpmScript("test:ci:costing-pilot-spotcheck-era17:cert");
  const env = parseCostingPilotSpotcheckEnv();

  const summary = buildCostingPilotSpotcheckSummary({
    certPassed: certExitCode === 0,
    ...env,
  });

  const artifactPath = join(process.cwd(), COSTING_PILOT_SPOTCHECK_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  for (const line of formatCostingPilotSpotcheckReportLines(summary)) {
    console.log(line);
  }

  console.log(`\nSummary artifact: ${COSTING_PILOT_SPOTCHECK_ERA17_SUMMARY_ARTIFACT}\n`);
  console.log("See docs/costing-pilot-spotcheck-era17.md\n");

  if (certExitCode !== 0) process.exit(certExitCode);
  if (!summary.operatorEmail) {
    console.log("SKIPPED WITH REASON — staging operator spot check not attested; cert passed.");
  }
  process.exit(0);
}

main();
