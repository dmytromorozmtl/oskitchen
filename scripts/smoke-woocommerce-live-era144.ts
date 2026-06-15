/**
 * Era 144 WooCommerce LIVE smoke orchestrator — REST webhook KDS inventory wiring cert.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  WOOCOMMERCE_LIVE_SMOKE_ERA144_CYCLE_RUNBOOK_STEPS,
  WOOCOMMERCE_LIVE_SMOKE_ERA144_NPM_SCRIPT,
  WOOCOMMERCE_LIVE_SMOKE_ERA144_OPS_DOC,
  WOOCOMMERCE_LIVE_SMOKE_ERA144_POLICY_ID,
  WOOCOMMERCE_LIVE_SMOKE_ERA144_SUMMARY_ARTIFACT,
} from "../lib/integrations/woocommerce-live-smoke-era144-policy";
import {
  auditWooCommerceLiveSmokeEra144Wiring,
  buildWooCommerceLiveSmokeEra144Summary,
  formatWooCommerceLiveSmokeEra144ReportLines,
} from "../lib/integrations/woocommerce-live-smoke-era144-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildWooCommerceLiveSmokeEra144Summary>,
): void {
  const path = join(process.cwd(), WOOCOMMERCE_LIVE_SMOKE_ERA144_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(
    `\nWooCommerce LIVE smoke (${WOOCOMMERCE_LIVE_SMOKE_ERA144_POLICY_ID})\n`,
  );
  for (const [index, step] of WOOCOMMERCE_LIVE_SMOKE_ERA144_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${WOOCOMMERCE_LIVE_SMOKE_ERA144_OPS_DOC}\n`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 144 WooCommerce LIVE smoke

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
    `\n[${WOOCOMMERCE_LIVE_SMOKE_ERA144_NPM_SCRIPT}] ${WOOCOMMERCE_LIVE_SMOKE_ERA144_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:woocommerce-live-smoke-era144:cert\n");
  const certCode = runNpmScript("test:ci:woocommerce-live-smoke-era144:cert");

  const wiring = auditWooCommerceLiveSmokeEra144Wiring(process.cwd());

  const summary = buildWooCommerceLiveSmokeEra144Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatWooCommerceLiveSmokeEra144ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${WOOCOMMERCE_LIVE_SMOKE_ERA144_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
