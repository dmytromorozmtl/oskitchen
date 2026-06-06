/**
 * Era 87 Square Payments LIVE smoke orchestrator — wiring cert + full live path.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_CYCLE_RUNBOOK_STEPS,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_NPM_SCRIPT,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_OPS_DOC,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_POLICY_ID,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_SUMMARY_ARTIFACT,
} from "../lib/integrations/square-payments-live-smoke-era87-policy";
import {
  auditSquarePaymentsLiveSmokeWiring,
  buildSquarePaymentsLiveSmokeEra87Summary,
  formatSquarePaymentsLiveSmokeEra87ReportLines,
} from "../lib/integrations/square-payments-live-smoke-summary";
import {
  runSquarePaymentsLiveSmoke,
  type SquarePaymentsLiveSmokeSummary,
} from "./smoke-square-payments-live";
import { loadSmokeEnv } from "./lib/load-smoke-env";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildSquarePaymentsLiveSmokeEra87Summary>,
): void {
  const path = join(process.cwd(), SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nSquare Payments live smoke (${SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_POLICY_ID})\n`);
  for (const [index, step] of SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_OPS_DOC}\n`);
}

function mapLiveSmoke(live: SquarePaymentsLiveSmokeSummary) {
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
Era 87 Square Payments LIVE smoke

  (default)         Cert chain + wiring audit + live OAuth path
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
    `\n[${SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_NPM_SCRIPT}] ${SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:square-payments-live-smoke-era87:cert\n");
  const certCode = runNpmScript("test:ci:square-payments-live-smoke-era87:cert");

  const wiring = auditSquarePaymentsLiveSmokeWiring(process.cwd());
  const wiringOnly = process.argv.includes("--wiring-only");

  let liveSmoke: SquarePaymentsLiveSmokeSummary | null = null;
  if (!wiringOnly) {
    console.log("\n→ npm run smoke:square-payments-live\n");
    try {
      liveSmoke = await runSquarePaymentsLiveSmoke();
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

  const summary = buildSquarePaymentsLiveSmokeEra87Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    liveSmoke: liveSmoke ? mapLiveSmoke(liveSmoke) : null,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatSquarePaymentsLiveSmokeEra87ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
