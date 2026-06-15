/**
 * Era 71 WooCommerce LIVE smoke orchestrator — wiring cert + full live path.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  WOOCOMMERCE_LIVE_SMOKE_ERA71_CYCLE_RUNBOOK_STEPS,
  WOOCOMMERCE_LIVE_SMOKE_ERA71_NPM_SCRIPT,
  WOOCOMMERCE_LIVE_SMOKE_ERA71_OPS_DOC,
  WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID,
  WOOCOMMERCE_LIVE_SMOKE_ERA71_SUMMARY_ARTIFACT,
} from "../lib/integrations/woocommerce-live-smoke-era71-policy";
import {
  auditWooCommerceLiveSmokeWiring,
  buildWooCommerceLiveSmokeEra71Summary,
  formatWooCommerceLiveSmokeEra71ReportLines,
} from "../lib/integrations/woocommerce-live-smoke-summary";
import {
  runWooCommerceLiveSmoke,
  type WooCommerceLiveSmokeSummary,
} from "./smoke-woocommerce-live";
import { loadSmokeEnv } from "./lib/load-smoke-env";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildWooCommerceLiveSmokeEra71Summary>): void {
  const path = join(process.cwd(), WOOCOMMERCE_LIVE_SMOKE_ERA71_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nWooCommerce live smoke (${WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID})\n`);
  for (const [index, step] of WOOCOMMERCE_LIVE_SMOKE_ERA71_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${WOOCOMMERCE_LIVE_SMOKE_ERA71_OPS_DOC}\n`);
}

function mapLiveSmoke(live: WooCommerceLiveSmokeSummary) {
  return {
    overall: live.overall,
    proofStatus: live.proofStatus,
    missingEnvVars: live.missingEnvVars,
    steps: live.steps.map((step) => ({
      id: step.id,
      label: step.label,
      status: step.status,
      reason: step.detail,
    })),
  };
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 71 WooCommerce LIVE smoke

  (default)         Cert chain + wiring audit + live dev-store path
  --checklist-only  Print activation runbook steps
  --wiring-only     Skip live REST/webhook run (cert + wiring audit only)
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  loadSmokeEnv();

  console.log(
    `\n[${WOOCOMMERCE_LIVE_SMOKE_ERA71_NPM_SCRIPT}] ${WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:woocommerce-live-smoke-era71:cert\n");
  const certCode = runNpmScript("test:ci:woocommerce-live-smoke-era71:cert");

  const wiring = auditWooCommerceLiveSmokeWiring(process.cwd());
  const wiringOnly = process.argv.includes("--wiring-only");

  let liveSmoke: WooCommerceLiveSmokeSummary | null = null;
  if (!wiringOnly) {
    console.log("\n→ npm run smoke:woo-live\n");
    try {
      liveSmoke = await runWooCommerceLiveSmoke();
      for (const step of liveSmoke.steps) {
        console.log(
          `  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`,
        );
      }
      console.log(`\nLive overall: ${liveSmoke.overall} | proofStatus: ${liveSmoke.proofStatus}\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Live smoke runtime error: ${message}`);
    }
  }

  const summary = buildWooCommerceLiveSmokeEra71Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    liveSmoke: liveSmoke ? mapLiveSmoke(liveSmoke) : null,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatWooCommerceLiveSmokeEra71ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${WOOCOMMERCE_LIVE_SMOKE_ERA71_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
