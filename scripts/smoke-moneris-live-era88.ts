/**
 * Era 88 Moneris LIVE smoke orchestrator — wiring cert + full live path.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  MONERIS_LIVE_SMOKE_ERA88_CYCLE_RUNBOOK_STEPS,
  MONERIS_LIVE_SMOKE_ERA88_NPM_SCRIPT,
  MONERIS_LIVE_SMOKE_ERA88_OPS_DOC,
  MONERIS_LIVE_SMOKE_ERA88_POLICY_ID,
  MONERIS_LIVE_SMOKE_ERA88_SUMMARY_ARTIFACT,
} from "../lib/integrations/moneris-live-smoke-era88-policy";
import {
  auditMonerisLiveSmokeWiring,
  buildMonerisLiveSmokeEra88Summary,
  formatMonerisLiveSmokeEra88ReportLines,
} from "../lib/integrations/moneris-live-smoke-summary";
import {
  runMonerisLiveSmoke,
  type MonerisLiveSmokeSummary,
} from "./smoke-moneris-live";
import { loadSmokeEnv } from "./lib/load-smoke-env";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(
  summary: ReturnType<typeof buildMonerisLiveSmokeEra88Summary>,
): void {
  const path = join(process.cwd(), MONERIS_LIVE_SMOKE_ERA88_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nMoneris live smoke (${MONERIS_LIVE_SMOKE_ERA88_POLICY_ID})\n`);
  for (const [index, step] of MONERIS_LIVE_SMOKE_ERA88_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${MONERIS_LIVE_SMOKE_ERA88_OPS_DOC}\n`);
}

function mapLiveSmoke(live: MonerisLiveSmokeSummary) {
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
Era 88 Moneris LIVE smoke

  (default)         Cert chain + wiring audit + live OAuth/gateway path
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
    `\n[${MONERIS_LIVE_SMOKE_ERA88_NPM_SCRIPT}] ${MONERIS_LIVE_SMOKE_ERA88_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:moneris-live-smoke-era88:cert\n");
  const certCode = runNpmScript("test:ci:moneris-live-smoke-era88:cert");

  const wiring = auditMonerisLiveSmokeWiring(process.cwd());
  const wiringOnly = process.argv.includes("--wiring-only");

  let liveSmoke: MonerisLiveSmokeSummary | null = null;
  if (!wiringOnly) {
    console.log("\n→ npm run smoke:moneris-live\n");
    try {
      liveSmoke = await runMonerisLiveSmoke();
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

  const summary = buildMonerisLiveSmokeEra88Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    liveSmoke: liveSmoke ? mapLiveSmoke(liveSmoke) : null,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatMonerisLiveSmokeEra88ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${MONERIS_LIVE_SMOKE_ERA88_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
