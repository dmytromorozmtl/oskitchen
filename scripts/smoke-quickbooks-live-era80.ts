/**
 * Era 80 QuickBooks LIVE smoke orchestrator — wiring cert + full live path.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  QUICKBOOKS_LIVE_SMOKE_ERA80_CYCLE_RUNBOOK_STEPS,
  QUICKBOOKS_LIVE_SMOKE_ERA80_NPM_SCRIPT,
  QUICKBOOKS_LIVE_SMOKE_ERA80_OPS_DOC,
  QUICKBOOKS_LIVE_SMOKE_ERA80_POLICY_ID,
  QUICKBOOKS_LIVE_SMOKE_ERA80_SUMMARY_ARTIFACT,
} from "../lib/integrations/quickbooks-live-smoke-era80-policy";
import {
  auditQuickBooksLiveSmokeWiring,
  buildQuickBooksLiveSmokeEra80Summary,
  formatQuickBooksLiveSmokeEra80ReportLines,
} from "../lib/integrations/quickbooks-live-smoke-summary";
import {
  runQuickBooksLiveSmoke,
  type QuickBooksLiveSmokeSummary,
} from "./smoke-quickbooks-live";
import { loadSmokeEnv } from "./lib/load-smoke-env";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildQuickBooksLiveSmokeEra80Summary>): void {
  const path = join(process.cwd(), QUICKBOOKS_LIVE_SMOKE_ERA80_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nQuickBooks live smoke (${QUICKBOOKS_LIVE_SMOKE_ERA80_POLICY_ID})\n`);
  for (const [index, step] of QUICKBOOKS_LIVE_SMOKE_ERA80_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${QUICKBOOKS_LIVE_SMOKE_ERA80_OPS_DOC}\n`);
}

function mapLiveSmoke(live: QuickBooksLiveSmokeSummary) {
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
Era 80 QuickBooks LIVE smoke

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
    `\n[${QUICKBOOKS_LIVE_SMOKE_ERA80_NPM_SCRIPT}] ${QUICKBOOKS_LIVE_SMOKE_ERA80_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:quickbooks-live-smoke-era80:cert\n");
  const certCode = runNpmScript("test:ci:quickbooks-live-smoke-era80:cert");

  const wiring = auditQuickBooksLiveSmokeWiring(process.cwd());
  const wiringOnly = process.argv.includes("--wiring-only");

  let liveSmoke: QuickBooksLiveSmokeSummary | null = null;
  if (!wiringOnly) {
    console.log("\n→ npm run smoke:quickbooks-live\n");
    try {
      liveSmoke = await runQuickBooksLiveSmoke();
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

  const summary = buildQuickBooksLiveSmokeEra80Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    liveSmoke: liveSmoke ? mapLiveSmoke(liveSmoke) : null,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatQuickBooksLiveSmokeEra80ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${QUICKBOOKS_LIVE_SMOKE_ERA80_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
