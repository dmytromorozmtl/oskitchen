/**
 * Era 76 Uber Eats LIVE smoke orchestrator — wiring cert + full live path.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  UBER_EATS_LIVE_SMOKE_ERA76_CYCLE_RUNBOOK_STEPS,
  UBER_EATS_LIVE_SMOKE_ERA76_NPM_SCRIPT,
  UBER_EATS_LIVE_SMOKE_ERA76_OPS_DOC,
  UBER_EATS_LIVE_SMOKE_ERA76_POLICY_ID,
  UBER_EATS_LIVE_SMOKE_ERA76_SUMMARY_ARTIFACT,
} from "../lib/integrations/uber-eats-live-smoke-era76-policy";
import {
  auditUberEatsLiveSmokeWiring,
  buildUberEatsLiveSmokeEra76Summary,
  formatUberEatsLiveSmokeEra76ReportLines,
} from "../lib/integrations/uber-eats-live-smoke-summary";
import {
  runUberEatsLiveSmoke,
  type UberEatsLiveSmokeSummary,
} from "./smoke-uber-eats-live";
import { loadSmokeEnv } from "./lib/load-smoke-env";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildUberEatsLiveSmokeEra76Summary>): void {
  const path = join(process.cwd(), UBER_EATS_LIVE_SMOKE_ERA76_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nUber Eats live smoke (${UBER_EATS_LIVE_SMOKE_ERA76_POLICY_ID})\n`);
  for (const [index, step] of UBER_EATS_LIVE_SMOKE_ERA76_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${UBER_EATS_LIVE_SMOKE_ERA76_OPS_DOC}\n`);
}

function mapLiveSmoke(live: UberEatsLiveSmokeSummary) {
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
Era 76 Uber Eats LIVE smoke

  (default)         Cert chain + wiring audit + live partner sandbox path
  --checklist-only  Print activation runbook steps
  --wiring-only     Skip live OAuth/webhook run (cert + wiring audit only)
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  loadSmokeEnv();

  console.log(
    `\n[${UBER_EATS_LIVE_SMOKE_ERA76_NPM_SCRIPT}] ${UBER_EATS_LIVE_SMOKE_ERA76_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:uber-eats-live-smoke-era76:cert\n");
  const certCode = runNpmScript("test:ci:uber-eats-live-smoke-era76:cert");

  const wiring = auditUberEatsLiveSmokeWiring(process.cwd());
  const wiringOnly = process.argv.includes("--wiring-only");

  let liveSmoke: UberEatsLiveSmokeSummary | null = null;
  if (!wiringOnly) {
    console.log("\n→ npm run smoke:uber-eats-live\n");
    try {
      liveSmoke = await runUberEatsLiveSmoke();
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

  const summary = buildUberEatsLiveSmokeEra76Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    liveSmoke: liveSmoke ? mapLiveSmoke(liveSmoke) : null,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatUberEatsLiveSmokeEra76ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${UBER_EATS_LIVE_SMOKE_ERA76_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
