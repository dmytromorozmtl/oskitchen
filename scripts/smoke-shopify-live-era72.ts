/**
 * Era 72 Shopify LIVE smoke orchestrator — wiring cert + full live path.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  SHOPIFY_LIVE_SMOKE_ERA72_CYCLE_RUNBOOK_STEPS,
  SHOPIFY_LIVE_SMOKE_ERA72_NPM_SCRIPT,
  SHOPIFY_LIVE_SMOKE_ERA72_OPS_DOC,
  SHOPIFY_LIVE_SMOKE_ERA72_POLICY_ID,
  SHOPIFY_LIVE_SMOKE_ERA72_SUMMARY_ARTIFACT,
} from "../lib/integrations/shopify-live-smoke-era72-policy";
import {
  auditShopifyLiveSmokeWiring,
  buildShopifyLiveSmokeEra72Summary,
  formatShopifyLiveSmokeEra72ReportLines,
} from "../lib/integrations/shopify-live-smoke-summary";
import {
  runShopifyLiveSmoke,
  type ShopifyLiveSmokeSummary,
} from "./smoke-shopify-live";
import { loadSmokeEnv } from "./lib/load-smoke-env";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildShopifyLiveSmokeEra72Summary>): void {
  const path = join(process.cwd(), SHOPIFY_LIVE_SMOKE_ERA72_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nShopify live smoke (${SHOPIFY_LIVE_SMOKE_ERA72_POLICY_ID})\n`);
  for (const [index, step] of SHOPIFY_LIVE_SMOKE_ERA72_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${SHOPIFY_LIVE_SMOKE_ERA72_OPS_DOC}\n`);
}

function mapLiveSmoke(live: ShopifyLiveSmokeSummary) {
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
Era 72 Shopify LIVE smoke

  (default)         Cert chain + wiring audit + live dev-store path
  --checklist-only  Print activation runbook steps
  --wiring-only     Skip live Admin API/webhook run (cert + wiring audit only)
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  loadSmokeEnv();

  console.log(
    `\n[${SHOPIFY_LIVE_SMOKE_ERA72_NPM_SCRIPT}] ${SHOPIFY_LIVE_SMOKE_ERA72_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:shopify-live-smoke-era72:cert\n");
  const certCode = runNpmScript("test:ci:shopify-live-smoke-era72:cert");

  const wiring = auditShopifyLiveSmokeWiring(process.cwd());
  const wiringOnly = process.argv.includes("--wiring-only");

  let liveSmoke: ShopifyLiveSmokeSummary | null = null;
  if (!wiringOnly) {
    console.log("\n→ npm run smoke:shopify-live\n");
    try {
      liveSmoke = await runShopifyLiveSmoke();
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

  const summary = buildShopifyLiveSmokeEra72Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    liveSmoke: liveSmoke ? mapLiveSmoke(liveSmoke) : null,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatShopifyLiveSmokeEra72ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${SHOPIFY_LIVE_SMOKE_ERA72_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
