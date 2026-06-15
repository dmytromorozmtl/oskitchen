/**
 * Era 84 Klaviyo LIVE smoke orchestrator — wiring cert + full live path.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  KLAVIYO_LIVE_SMOKE_ERA84_CYCLE_RUNBOOK_STEPS,
  KLAVIYO_LIVE_SMOKE_ERA84_NPM_SCRIPT,
  KLAVIYO_LIVE_SMOKE_ERA84_OPS_DOC,
  KLAVIYO_LIVE_SMOKE_ERA84_POLICY_ID,
  KLAVIYO_LIVE_SMOKE_ERA84_SUMMARY_ARTIFACT,
} from "../lib/integrations/klaviyo-live-smoke-era84-policy";
import {
  auditKlaviyoLiveSmokeWiring,
  buildKlaviyoLiveSmokeEra84Summary,
  formatKlaviyoLiveSmokeEra84ReportLines,
} from "../lib/integrations/klaviyo-live-smoke-summary";
import { runKlaviyoLiveSmoke, type KlaviyoLiveSmokeSummary } from "./smoke-klaviyo-live";
import { loadSmokeEnv } from "./lib/load-smoke-env";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildKlaviyoLiveSmokeEra84Summary>): void {
  const path = join(process.cwd(), KLAVIYO_LIVE_SMOKE_ERA84_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nKlaviyo live smoke (${KLAVIYO_LIVE_SMOKE_ERA84_POLICY_ID})\n`);
  for (const [index, step] of KLAVIYO_LIVE_SMOKE_ERA84_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${KLAVIYO_LIVE_SMOKE_ERA84_OPS_DOC}\n`);
}

function mapLiveSmoke(live: KlaviyoLiveSmokeSummary) {
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
Era 84 Klaviyo LIVE smoke

  (default)         Cert chain + wiring audit + live API key path
  --checklist-only  Print activation runbook steps
  --wiring-only     Skip live API run (cert + wiring audit only)
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  loadSmokeEnv();

  console.log(`\n[${KLAVIYO_LIVE_SMOKE_ERA84_NPM_SCRIPT}] ${KLAVIYO_LIVE_SMOKE_ERA84_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:klaviyo-live-smoke-era84:cert\n");
  const certCode = runNpmScript("test:ci:klaviyo-live-smoke-era84:cert");

  const wiring = auditKlaviyoLiveSmokeWiring(process.cwd());
  const wiringOnly = process.argv.includes("--wiring-only");

  let liveSmoke: KlaviyoLiveSmokeSummary | null = null;
  if (!wiringOnly) {
    console.log("\n→ npm run smoke:klaviyo-live\n");
    try {
      liveSmoke = await runKlaviyoLiveSmoke();
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

  const summary = buildKlaviyoLiveSmokeEra84Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    liveSmoke: liveSmoke ? mapLiveSmoke(liveSmoke) : null,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatKlaviyoLiveSmokeEra84ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${KLAVIYO_LIVE_SMOKE_ERA84_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
