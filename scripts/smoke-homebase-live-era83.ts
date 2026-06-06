/**
 * Era 83 Homebase LIVE smoke orchestrator — wiring cert + full live path.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  HOMEBASE_LIVE_SMOKE_ERA83_CYCLE_RUNBOOK_STEPS,
  HOMEBASE_LIVE_SMOKE_ERA83_NPM_SCRIPT,
  HOMEBASE_LIVE_SMOKE_ERA83_OPS_DOC,
  HOMEBASE_LIVE_SMOKE_ERA83_POLICY_ID,
  HOMEBASE_LIVE_SMOKE_ERA83_SUMMARY_ARTIFACT,
} from "../lib/integrations/homebase-live-smoke-era83-policy";
import {
  auditHomebaseLiveSmokeWiring,
  buildHomebaseLiveSmokeEra83Summary,
  formatHomebaseLiveSmokeEra83ReportLines,
} from "../lib/integrations/homebase-live-smoke-summary";
import { runHomebaseLiveSmoke, type HomebaseLiveSmokeSummary } from "./smoke-homebase-live";
import { loadSmokeEnv } from "./lib/load-smoke-env";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildHomebaseLiveSmokeEra83Summary>): void {
  const path = join(process.cwd(), HOMEBASE_LIVE_SMOKE_ERA83_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nHomebase live smoke (${HOMEBASE_LIVE_SMOKE_ERA83_POLICY_ID})\n`);
  for (const [index, step] of HOMEBASE_LIVE_SMOKE_ERA83_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${HOMEBASE_LIVE_SMOKE_ERA83_OPS_DOC}\n`);
}

function mapLiveSmoke(live: HomebaseLiveSmokeSummary) {
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
Era 83 Homebase LIVE smoke

  (default)         Cert chain + wiring audit + live sandbox path
  --checklist-only  Print activation runbook steps
  --wiring-only     Skip live OAuth/API run (cert + wiring audit only)
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  loadSmokeEnv();

  console.log(`\n[${HOMEBASE_LIVE_SMOKE_ERA83_NPM_SCRIPT}] ${HOMEBASE_LIVE_SMOKE_ERA83_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:homebase-live-smoke-era83:cert\n");
  const certCode = runNpmScript("test:ci:homebase-live-smoke-era83:cert");

  const wiring = auditHomebaseLiveSmokeWiring(process.cwd());
  const wiringOnly = process.argv.includes("--wiring-only");

  let liveSmoke: HomebaseLiveSmokeSummary | null = null;
  if (!wiringOnly) {
    console.log("\n→ npm run smoke:homebase-live\n");
    try {
      liveSmoke = await runHomebaseLiveSmoke();
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

  const summary = buildHomebaseLiveSmokeEra83Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    liveSmoke: liveSmoke ? mapLiveSmoke(liveSmoke) : null,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatHomebaseLiveSmokeEra83ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${HOMEBASE_LIVE_SMOKE_ERA83_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
