/**
 * Era 89 OpenTable LIVE smoke orchestrator — wiring cert + full live path.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  OPENTABLE_LIVE_SMOKE_ERA89_CYCLE_RUNBOOK_STEPS,
  OPENTABLE_LIVE_SMOKE_ERA89_NPM_SCRIPT,
  OPENTABLE_LIVE_SMOKE_ERA89_OPS_DOC,
  OPENTABLE_LIVE_SMOKE_ERA89_POLICY_ID,
  OPENTABLE_LIVE_SMOKE_ERA89_SUMMARY_ARTIFACT,
} from "../lib/integrations/opentable-live-smoke-era89-policy";
import {
  auditOpenTableLiveSmokeWiring,
  buildOpenTableLiveSmokeEra89Summary,
  formatOpenTableLiveSmokeEra89ReportLines,
} from "../lib/integrations/opentable-live-smoke-summary";
import {
  runOpenTableLiveSmoke,
  type OpenTableLiveSmokeSummary,
} from "./smoke-opentable-live";
import { loadSmokeEnv } from "./lib/load-smoke-env";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildOpenTableLiveSmokeEra89Summary>,
): void {
  const path = join(process.cwd(), OPENTABLE_LIVE_SMOKE_ERA89_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nOpenTable live smoke (${OPENTABLE_LIVE_SMOKE_ERA89_POLICY_ID})\n`);
  for (const [index, step] of OPENTABLE_LIVE_SMOKE_ERA89_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${OPENTABLE_LIVE_SMOKE_ERA89_OPS_DOC}\n`);
}

function mapLiveSmoke(live: OpenTableLiveSmokeSummary) {
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
Era 89 OpenTable LIVE smoke

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
    `\n[${OPENTABLE_LIVE_SMOKE_ERA89_NPM_SCRIPT}] ${OPENTABLE_LIVE_SMOKE_ERA89_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:opentable-live-smoke-era89:cert\n");
  const certCode = runNpmScript("test:ci:opentable-live-smoke-era89:cert");

  const wiring = auditOpenTableLiveSmokeWiring(process.cwd());
  const wiringOnly = process.argv.includes("--wiring-only");

  let liveSmoke: OpenTableLiveSmokeSummary | null = null;
  if (!wiringOnly) {
    console.log("\n→ npm run smoke:opentable-live\n");
    try {
      liveSmoke = await runOpenTableLiveSmoke();
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

  const summary = buildOpenTableLiveSmokeEra89Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    liveSmoke: liveSmoke ? mapLiveSmoke(liveSmoke) : null,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatOpenTableLiveSmokeEra89ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${OPENTABLE_LIVE_SMOKE_ERA89_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
