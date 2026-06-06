/**
 * Era 153 Shopify LIVE integration orchestrator — Admin API webhook KDS inventory wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  SHOPIFY_LIVE_SMOKE_ERA153_CYCLE_RUNBOOK_STEPS,
  SHOPIFY_LIVE_SMOKE_ERA153_NPM_SCRIPT,
  SHOPIFY_LIVE_SMOKE_ERA153_OPS_DOC,
  SHOPIFY_LIVE_SMOKE_ERA153_POLICY_ID,
  SHOPIFY_LIVE_SMOKE_ERA153_SUMMARY_ARTIFACT,
} from "../lib/integrations/shopify-live-smoke-era153-policy";
import {
  auditShopifyLiveSmokeEra153Wiring,
  buildShopifyLiveSmokeEra153Summary,
  formatShopifyLiveSmokeEra153ReportLines,
} from "../lib/integrations/shopify-live-smoke-era153-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildShopifyLiveSmokeEra153Summary>,
): void {
  const path = join(process.cwd(), SHOPIFY_LIVE_SMOKE_ERA153_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nShopify LIVE integration (${SHOPIFY_LIVE_SMOKE_ERA153_POLICY_ID})\n`);
  for (const [index, step] of SHOPIFY_LIVE_SMOKE_ERA153_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${SHOPIFY_LIVE_SMOKE_ERA153_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 153 Shopify LIVE integration smoke

  (default)         Cert chain + wiring audit
  --checklist-only  Print activation runbook steps
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(
    `\n[${SHOPIFY_LIVE_SMOKE_ERA153_NPM_SCRIPT}] ${SHOPIFY_LIVE_SMOKE_ERA153_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:shopify-live-smoke-era153:cert\n");
  const certCode = runNpmScript("test:ci:shopify-live-smoke-era153:cert");

  const wiring = auditShopifyLiveSmokeEra153Wiring(process.cwd());

  const summary = buildShopifyLiveSmokeEra153Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatShopifyLiveSmokeEra153ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${SHOPIFY_LIVE_SMOKE_ERA153_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
