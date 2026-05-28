/**
 * Era 17 enterprise SSO operator runbook smoke — cert chain + summary artifact.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_NPM_SCRIPT,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_POLICY_ID,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_SUMMARY_ARTIFACT,
} from "../lib/enterprise/enterprise-sso-operator-runbook-era17-policy";
import {
  buildEnterpriseSsoOperatorRunbookSummary,
  formatEnterpriseSsoOperatorRunbookReportLines,
} from "../lib/enterprise/enterprise-sso-operator-runbook-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildEnterpriseSsoOperatorRunbookSummary>): void {
  const path = join(process.cwd(), ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 17 enterprise SSO operator runbook smoke

  (default)  Cert chain + operator runbook summary artifact
`);
    process.exit(0);
  }

  console.log(
    `\n[${ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_NPM_SCRIPT}] ${ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:enterprise-sso-operator-runbook-era17:cert\n");
  const certCode = runNpmScript("test:ci:enterprise-sso-operator-runbook-era17:cert");
  const summary = buildEnterpriseSsoOperatorRunbookSummary({
    certPassed: certCode === 0,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatEnterpriseSsoOperatorRunbookReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_SUMMARY_ARTIFACT}\n`);
  console.log("See docs/enterprise-sso-operator-runbook-era17.md\n");
  console.log(
    "SSO delivery remains pilot_foundation — run smoke:enterprise-sso-idp-staging for Cycle 2 IdP login proof.\n",
  );

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
