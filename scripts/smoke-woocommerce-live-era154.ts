/**
 * Era 154 WooCommerce LIVE integration orchestrator — REST webhook canonical order KDS wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  WOOCOMMERCE_LIVE_SMOKE_ERA154_CYCLE_RUNBOOK_STEPS,
  WOOCOMMERCE_LIVE_SMOKE_ERA154_NPM_SCRIPT,
  WOOCOMMERCE_LIVE_SMOKE_ERA154_OPS_DOC,
  WOOCOMMERCE_LIVE_SMOKE_ERA154_POLICY_ID,
  WOOCOMMERCE_LIVE_SMOKE_ERA154_SUMMARY_ARTIFACT,
} from "../lib/integrations/woocommerce-live-smoke-era154-policy";
import {
  auditWooCommerceLiveSmokeEra154Wiring,
  buildWooCommerceLiveSmokeEra154Summary,
  formatWooCommerceLiveSmokeEra154ReportLines,
} from "../lib/integrations/woocommerce-live-smoke-era154-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildWooCommerceLiveSmokeEra154Summary>,
): void {
  const path = join(process.cwd(), WOOCOMMERCE_LIVE_SMOKE_ERA154_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(
    `\nWooCommerce LIVE integration (${WOOCOMMERCE_LIVE_SMOKE_ERA154_POLICY_ID})\n`,
  );
  for (const [index, step] of WOOCOMMERCE_LIVE_SMOKE_ERA154_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${WOOCOMMERCE_LIVE_SMOKE_ERA154_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 154 WooCommerce LIVE integration smoke

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
    `\n[${WOOCOMMERCE_LIVE_SMOKE_ERA154_NPM_SCRIPT}] ${WOOCOMMERCE_LIVE_SMOKE_ERA154_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:woocommerce-live-smoke-era154:cert\n");
  const certCode = runNpmScript("test:ci:woocommerce-live-smoke-era154:cert");

  const wiring = auditWooCommerceLiveSmokeEra154Wiring(process.cwd());

  const summary = buildWooCommerceLiveSmokeEra154Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatWooCommerceLiveSmokeEra154ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${WOOCOMMERCE_LIVE_SMOKE_ERA154_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
