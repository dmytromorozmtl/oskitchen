/**
 * Era 78 Grubhub LIVE smoke orchestrator — wiring cert + full live path.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  GRUBHUB_LIVE_SMOKE_ERA78_CYCLE_RUNBOOK_STEPS,
  GRUBHUB_LIVE_SMOKE_ERA78_NPM_SCRIPT,
  GRUBHUB_LIVE_SMOKE_ERA78_OPS_DOC,
  GRUBHUB_LIVE_SMOKE_ERA78_POLICY_ID,
  GRUBHUB_LIVE_SMOKE_ERA78_SUMMARY_ARTIFACT,
} from "../lib/integrations/grubhub-live-smoke-era78-policy";
import {
  auditGrubhubLiveSmokeWiring,
  buildGrubhubLiveSmokeEra78Summary,
  formatGrubhubLiveSmokeEra78ReportLines,
} from "../lib/integrations/grubhub-live-smoke-summary";
import {
  runGrubhubLiveSmoke,
  type GrubhubLiveSmokeSummary,
} from "./smoke-grubhub-live";
import { loadSmokeEnv } from "./lib/load-smoke-env";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildGrubhubLiveSmokeEra78Summary>): void {
  const path = join(process.cwd(), GRUBHUB_LIVE_SMOKE_ERA78_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nGrubhub live smoke (${GRUBHUB_LIVE_SMOKE_ERA78_POLICY_ID})\n`);
  for (const [index, step] of GRUBHUB_LIVE_SMOKE_ERA78_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${GRUBHUB_LIVE_SMOKE_ERA78_OPS_DOC}\n`);
}

function mapLiveSmoke(live: GrubhubLiveSmokeSummary) {
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
Era 78 Grubhub LIVE smoke

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
    `\n[${GRUBHUB_LIVE_SMOKE_ERA78_NPM_SCRIPT}] ${GRUBHUB_LIVE_SMOKE_ERA78_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:grubhub-live-smoke-era78:cert\n");
  const certCode = runNpmScript("test:ci:grubhub-live-smoke-era78:cert");

  const wiring = auditGrubhubLiveSmokeWiring(process.cwd());
  const wiringOnly = process.argv.includes("--wiring-only");

  let liveSmoke: GrubhubLiveSmokeSummary | null = null;
  if (!wiringOnly) {
    console.log("\n→ npm run smoke:grubhub-live\n");
    try {
      liveSmoke = await runGrubhubLiveSmoke();
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

  const summary = buildGrubhubLiveSmokeEra78Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    liveSmoke: liveSmoke ? mapLiveSmoke(liveSmoke) : null,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatGrubhubLiveSmokeEra78ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${GRUBHUB_LIVE_SMOKE_ERA78_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
