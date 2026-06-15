/**
 * Era 81 Xero LIVE smoke orchestrator — wiring cert + full live path.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  XERO_LIVE_SMOKE_ERA81_CYCLE_RUNBOOK_STEPS,
  XERO_LIVE_SMOKE_ERA81_NPM_SCRIPT,
  XERO_LIVE_SMOKE_ERA81_OPS_DOC,
  XERO_LIVE_SMOKE_ERA81_POLICY_ID,
  XERO_LIVE_SMOKE_ERA81_SUMMARY_ARTIFACT,
} from "../lib/integrations/xero-live-smoke-era81-policy";
import {
  auditXeroLiveSmokeWiring,
  buildXeroLiveSmokeEra81Summary,
  formatXeroLiveSmokeEra81ReportLines,
} from "../lib/integrations/xero-live-smoke-summary";
import { runXeroLiveSmoke, type XeroLiveSmokeSummary } from "./smoke-xero-live";
import { loadSmokeEnv } from "./lib/load-smoke-env";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildXeroLiveSmokeEra81Summary>): void {
  const path = join(process.cwd(), XERO_LIVE_SMOKE_ERA81_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nXero live smoke (${XERO_LIVE_SMOKE_ERA81_POLICY_ID})\n`);
  for (const [index, step] of XERO_LIVE_SMOKE_ERA81_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${XERO_LIVE_SMOKE_ERA81_OPS_DOC}\n`);
}

function mapLiveSmoke(live: XeroLiveSmokeSummary) {
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
Era 81 Xero LIVE smoke

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

  console.log(`\n[${XERO_LIVE_SMOKE_ERA81_NPM_SCRIPT}] ${XERO_LIVE_SMOKE_ERA81_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:xero-live-smoke-era81:cert\n");
  const certCode = runNpmScript("test:ci:xero-live-smoke-era81:cert");

  const wiring = auditXeroLiveSmokeWiring(process.cwd());
  const wiringOnly = process.argv.includes("--wiring-only");

  let liveSmoke: XeroLiveSmokeSummary | null = null;
  if (!wiringOnly) {
    console.log("\n→ npm run smoke:xero-live\n");
    try {
      liveSmoke = await runXeroLiveSmoke();
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

  const summary = buildXeroLiveSmokeEra81Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    liveSmoke: liveSmoke ? mapLiveSmoke(liveSmoke) : null,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatXeroLiveSmokeEra81ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${XERO_LIVE_SMOKE_ERA81_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
