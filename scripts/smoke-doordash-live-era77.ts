/**
 * Era 77 DoorDash LIVE smoke orchestrator — wiring cert + full live path.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  DOORDASH_LIVE_SMOKE_ERA77_CYCLE_RUNBOOK_STEPS,
  DOORDASH_LIVE_SMOKE_ERA77_NPM_SCRIPT,
  DOORDASH_LIVE_SMOKE_ERA77_OPS_DOC,
  DOORDASH_LIVE_SMOKE_ERA77_POLICY_ID,
  DOORDASH_LIVE_SMOKE_ERA77_SUMMARY_ARTIFACT,
} from "../lib/integrations/doordash-live-smoke-era77-policy";
import {
  auditDoorDashLiveSmokeWiring,
  buildDoorDashLiveSmokeEra77Summary,
  formatDoorDashLiveSmokeEra77ReportLines,
} from "../lib/integrations/doordash-live-smoke-summary";
import {
  runDoorDashLiveSmoke,
  type DoorDashLiveSmokeSummary,
} from "./smoke-doordash-live";
import { loadSmokeEnv } from "./lib/load-smoke-env";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildDoorDashLiveSmokeEra77Summary>): void {
  const path = join(process.cwd(), DOORDASH_LIVE_SMOKE_ERA77_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nDoorDash live smoke (${DOORDASH_LIVE_SMOKE_ERA77_POLICY_ID})\n`);
  for (const [index, step] of DOORDASH_LIVE_SMOKE_ERA77_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${DOORDASH_LIVE_SMOKE_ERA77_OPS_DOC}\n`);
}

function mapLiveSmoke(live: DoorDashLiveSmokeSummary) {
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
Era 77 DoorDash LIVE smoke

  (default)         Cert chain + wiring audit + live partner sandbox path
  --checklist-only  Print activation runbook steps
  --wiring-only     Skip live API/webhook run (cert + wiring audit only)
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  loadSmokeEnv();

  console.log(
    `\n[${DOORDASH_LIVE_SMOKE_ERA77_NPM_SCRIPT}] ${DOORDASH_LIVE_SMOKE_ERA77_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:doordash-live-smoke-era77:cert\n");
  const certCode = runNpmScript("test:ci:doordash-live-smoke-era77:cert");

  const wiring = auditDoorDashLiveSmokeWiring(process.cwd());
  const wiringOnly = process.argv.includes("--wiring-only");

  let liveSmoke: DoorDashLiveSmokeSummary | null = null;
  if (!wiringOnly) {
    console.log("\n→ npm run smoke:doordash-live\n");
    try {
      liveSmoke = await runDoorDashLiveSmoke();
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

  const summary = buildDoorDashLiveSmokeEra77Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    liveSmoke: liveSmoke ? mapLiveSmoke(liveSmoke) : null,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatDoorDashLiveSmokeEra77ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${DOORDASH_LIVE_SMOKE_ERA77_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
