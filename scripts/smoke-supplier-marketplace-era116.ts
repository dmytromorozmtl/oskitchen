/**
 * Era 116 Supplier Marketplace orchestrator — three-lane wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  SUPPLIER_MARKETPLACE_ERA116_CYCLE_RUNBOOK_STEPS,
  SUPPLIER_MARKETPLACE_ERA116_NPM_SCRIPT,
  SUPPLIER_MARKETPLACE_ERA116_OPS_DOC,
  SUPPLIER_MARKETPLACE_ERA116_POLICY_ID,
  SUPPLIER_MARKETPLACE_ERA116_SUMMARY_ARTIFACT,
} from "../lib/marketplace/supplier-marketplace-era116-policy";
import {
  auditSupplierMarketplaceSmokeWiring,
  buildSupplierMarketplaceSmokeEra116Summary,
  formatSupplierMarketplaceSmokeEra116ReportLines,
} from "../lib/marketplace/supplier-marketplace-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildSupplierMarketplaceSmokeEra116Summary>,
): void {
  const path = join(process.cwd(), SUPPLIER_MARKETPLACE_ERA116_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nSupplier Marketplace smoke (${SUPPLIER_MARKETPLACE_ERA116_POLICY_ID})\n`);
  for (const [index, step] of SUPPLIER_MARKETPLACE_ERA116_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${SUPPLIER_MARKETPLACE_ERA116_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 116 Supplier Marketplace smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${SUPPLIER_MARKETPLACE_ERA116_NPM_SCRIPT}] ${SUPPLIER_MARKETPLACE_ERA116_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:supplier-marketplace-era116:cert\n");
  const certCode = runNpmScript("test:ci:supplier-marketplace-era116:cert");

  const wiring = auditSupplierMarketplaceSmokeWiring(process.cwd());

  const summary = buildSupplierMarketplaceSmokeEra116Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatSupplierMarketplaceSmokeEra116ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${SUPPLIER_MARKETPLACE_ERA116_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
