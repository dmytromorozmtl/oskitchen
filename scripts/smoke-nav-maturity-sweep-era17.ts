/**
 * Era 17 nav maturity sweep smoke — cert chain + summary artifact.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  NAV_MATURITY_SWEEP_ERA17_POLICY_ID,
  NAV_MATURITY_SWEEP_ERA17_SUMMARY_ARTIFACT,
} from "../lib/navigation/nav-maturity-sweep-era17-policy";
import {
  buildNavMaturitySweepEra17Summary,
  formatNavMaturitySweepEra17ReportLines,
  parseNavMaturitySweepEra17Env,
} from "../lib/navigation/nav-maturity-sweep-era17-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function main() {
  console.log(`\n[smoke:nav-maturity-sweep-era17] ${NAV_MATURITY_SWEEP_ERA17_POLICY_ID}\n`);

  const certExitCode = runNpmScript("test:ci:nav-maturity-sweep-era17:cert");
  const env = parseNavMaturitySweepEra17Env();

  const summary = buildNavMaturitySweepEra17Summary({
    certPassed: certExitCode === 0,
    ...env,
  });

  const artifactPath = join(process.cwd(), NAV_MATURITY_SWEEP_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  for (const line of formatNavMaturitySweepEra17ReportLines(summary)) {
    console.log(line);
  }

  console.log(`\nSummary artifact: ${NAV_MATURITY_SWEEP_ERA17_SUMMARY_ARTIFACT}\n`);

  if (certExitCode !== 0) process.exit(certExitCode);
  if (!summary.auditPassed) process.exit(1);
  if (!summary.productSignoffEmail) {
    console.log("SKIPPED WITH REASON — product signoff not attested; cert and audit passed.");
  }
  process.exit(0);
}

main();
