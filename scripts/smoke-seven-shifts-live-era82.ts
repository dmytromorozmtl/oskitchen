/**
 * Era 82 7shifts LIVE smoke orchestrator — wiring cert + full live path.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_CYCLE_RUNBOOK_STEPS,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_NPM_SCRIPT,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_OPS_DOC,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_POLICY_ID,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_SUMMARY_ARTIFACT,
} from "../lib/integrations/seven-shifts-live-smoke-era82-policy";
import {
  auditSevenShiftsLiveSmokeWiring,
  buildSevenShiftsLiveSmokeEra82Summary,
  formatSevenShiftsLiveSmokeEra82ReportLines,
} from "../lib/integrations/seven-shifts-live-smoke-summary";
import {
  runSevenShiftsLiveSmoke,
  type SevenShiftsLiveSmokeSummary,
} from "./smoke-seven-shifts-live";
import { loadSmokeEnv } from "./lib/load-smoke-env";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildSevenShiftsLiveSmokeEra82Summary>): void {
  const path = join(process.cwd(), SEVEN_SHIFTS_LIVE_SMOKE_ERA82_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\n7shifts live smoke (${SEVEN_SHIFTS_LIVE_SMOKE_ERA82_POLICY_ID})\n`);
  for (const [index, step] of SEVEN_SHIFTS_LIVE_SMOKE_ERA82_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${SEVEN_SHIFTS_LIVE_SMOKE_ERA82_OPS_DOC}\n`);
}

function mapLiveSmoke(live: SevenShiftsLiveSmokeSummary) {
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
Era 82 7shifts LIVE smoke

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

  console.log(
    `\n[${SEVEN_SHIFTS_LIVE_SMOKE_ERA82_NPM_SCRIPT}] ${SEVEN_SHIFTS_LIVE_SMOKE_ERA82_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:seven-shifts-live-smoke-era82:cert\n");
  const certCode = runNpmScript("test:ci:seven-shifts-live-smoke-era82:cert");

  const wiring = auditSevenShiftsLiveSmokeWiring(process.cwd());
  const wiringOnly = process.argv.includes("--wiring-only");

  let liveSmoke: SevenShiftsLiveSmokeSummary | null = null;
  if (!wiringOnly) {
    console.log("\n→ npm run smoke:seven-shifts-live\n");
    try {
      liveSmoke = await runSevenShiftsLiveSmoke();
      for (const step of liveSmoke.steps) {
        console.log(
          `  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`,
        );
      }
      console.log(
        `\nLive overall: ${liveSmoke.overall} | proofStatus: ${liveSmoke.proofStatus}\n`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Live smoke runtime error: ${message}`);
    }
  }

  const summary = buildSevenShiftsLiveSmokeEra82Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    liveSmoke: liveSmoke ? mapLiveSmoke(liveSmoke) : null,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatSevenShiftsLiveSmokeEra82ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${SEVEN_SHIFTS_LIVE_SMOKE_ERA82_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
