/**
 * Era 140 Audit & Compliance orchestrator — SOC2 audit trail wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  AUDIT_COMPLIANCE_ERA140_CYCLE_RUNBOOK_STEPS,
  AUDIT_COMPLIANCE_ERA140_NPM_SCRIPT,
  AUDIT_COMPLIANCE_ERA140_OPS_DOC,
  AUDIT_COMPLIANCE_ERA140_POLICY_ID,
  AUDIT_COMPLIANCE_ERA140_SUMMARY_ARTIFACT,
} from "../lib/enterprise/audit-compliance-era140-policy";
import {
  auditAuditComplianceSmokeWiring,
  buildAuditComplianceSmokeEra140Summary,
  formatAuditComplianceSmokeEra140ReportLines,
} from "../lib/enterprise/audit-compliance-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildAuditComplianceSmokeEra140Summary>,
): void {
  const path = join(process.cwd(), AUDIT_COMPLIANCE_ERA140_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nAudit & Compliance smoke (${AUDIT_COMPLIANCE_ERA140_POLICY_ID})\n`);
  for (const [index, step] of AUDIT_COMPLIANCE_ERA140_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${AUDIT_COMPLIANCE_ERA140_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 140 Audit & Compliance smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${AUDIT_COMPLIANCE_ERA140_NPM_SCRIPT}] ${AUDIT_COMPLIANCE_ERA140_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:audit-compliance-era140:cert\n");
  const certCode = runNpmScript("test:ci:audit-compliance-era140:cert");

  const wiring = auditAuditComplianceSmokeWiring(process.cwd());

  const summary = buildAuditComplianceSmokeEra140Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatAuditComplianceSmokeEra140ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${AUDIT_COMPLIANCE_ERA140_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
