/**
 * Era 17 SSO pilot_ready gate smoke — evaluates Cycle 2 IdP staging artifact.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  ENTERPRISE_SSO_PILOT_READY_ERA17_GATE_RUNBOOK_STEPS,
  ENTERPRISE_SSO_PILOT_READY_ERA17_INPUT_ARTIFACT,
  ENTERPRISE_SSO_PILOT_READY_ERA17_NPM_SCRIPT,
  ENTERPRISE_SSO_PILOT_READY_ERA17_POLICY_ID,
  ENTERPRISE_SSO_PILOT_READY_ERA17_SUMMARY_ARTIFACT,
} from "../lib/enterprise/enterprise-sso-pilot-ready-era17-policy";
import {
  buildEnterpriseSsoPilotReadyGateSummary,
  formatEnterpriseSsoPilotReadyGateReportLines,
  type EnterpriseSsoPilotReadyGateInputArtifact,
} from "../lib/enterprise/enterprise-sso-pilot-ready-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function loadIdpStagingArtifact(): EnterpriseSsoPilotReadyGateInputArtifact | null {
  const path = join(process.cwd(), ENTERPRISE_SSO_PILOT_READY_ERA17_INPUT_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as EnterpriseSsoPilotReadyGateInputArtifact;
  } catch {
    return null;
  }
}

function writeSummary(
  summary: ReturnType<typeof buildEnterpriseSsoPilotReadyGateSummary>,
): void {
  const path = join(process.cwd(), ENTERPRISE_SSO_PILOT_READY_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 17 SSO pilot_ready gate smoke

  (default)       Evaluate IdP staging artifact + write gate summary
  --checklist-only  Print gate runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    console.log(`\nSSO pilot_ready gate (${ENTERPRISE_SSO_PILOT_READY_ERA17_POLICY_ID})\n`);
    for (const [index, step] of ENTERPRISE_SSO_PILOT_READY_ERA17_GATE_RUNBOOK_STEPS.entries()) {
      console.log(`${index + 1}. ${step}`);
    }
    process.exit(0);
  }

  console.log(
    `\n[${ENTERPRISE_SSO_PILOT_READY_ERA17_NPM_SCRIPT}] ${ENTERPRISE_SSO_PILOT_READY_ERA17_POLICY_ID}\n`,
  );

  console.log("\n→ npm run test:ci:enterprise-sso-pilot-ready-era17:cert\n");
  const certCode = runNpmScript("test:ci:enterprise-sso-pilot-ready-era17:cert");
  if (certCode !== 0) {
    process.exit(certCode);
  }

  const idpStagingArtifact = loadIdpStagingArtifact();
  const summary = buildEnterpriseSsoPilotReadyGateSummary({
    idpStagingArtifact,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    inputArtifactPath: ENTERPRISE_SSO_PILOT_READY_ERA17_INPUT_ARTIFACT,
  });
  writeSummary(summary);

  console.log("");
  for (const line of formatEnterpriseSsoPilotReadyGateReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${ENTERPRISE_SSO_PILOT_READY_ERA17_SUMMARY_ARTIFACT}\n`);

  if (summary.gateOutcome === "pilot_foundation_proof_failed") {
    process.exit(1);
  }
}

main();
