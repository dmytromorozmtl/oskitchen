/**
 * Era 86 Stripe LIVE smoke orchestrator — wiring cert + full live path.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  STRIPE_LIVE_SMOKE_ERA86_CYCLE_RUNBOOK_STEPS,
  STRIPE_LIVE_SMOKE_ERA86_NPM_SCRIPT,
  STRIPE_LIVE_SMOKE_ERA86_OPS_DOC,
  STRIPE_LIVE_SMOKE_ERA86_POLICY_ID,
  STRIPE_LIVE_SMOKE_ERA86_SUMMARY_ARTIFACT,
} from "../lib/integrations/stripe-live-smoke-era86-policy";
import {
  auditStripeLiveSmokeWiring,
  buildStripeLiveSmokeEra86Summary,
  formatStripeLiveSmokeEra86ReportLines,
} from "../lib/integrations/stripe-live-smoke-summary";
import { runStripeLiveSmoke, type StripeLiveSmokeSummary } from "./smoke-stripe-live";
import { loadSmokeEnv } from "./lib/load-smoke-env";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildStripeLiveSmokeEra86Summary>): void {
  const path = join(process.cwd(), STRIPE_LIVE_SMOKE_ERA86_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nStripe live smoke (${STRIPE_LIVE_SMOKE_ERA86_POLICY_ID})\n`);
  for (const [index, step] of STRIPE_LIVE_SMOKE_ERA86_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${STRIPE_LIVE_SMOKE_ERA86_OPS_DOC}\n`);
}

function mapLiveSmoke(live: StripeLiveSmokeSummary) {
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
Era 86 Stripe LIVE smoke

  (default)         Cert chain + wiring audit + live API path
  --checklist-only  Print activation runbook steps
  --wiring-only     Skip live API run (cert + wiring audit only)
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  loadSmokeEnv();

  console.log(`\n[${STRIPE_LIVE_SMOKE_ERA86_NPM_SCRIPT}] ${STRIPE_LIVE_SMOKE_ERA86_POLICY_ID}\n`);
  console.log("\n→ npm run test:ci:stripe-live-smoke-era86:cert\n");
  const certCode = runNpmScript("test:ci:stripe-live-smoke-era86:cert");

  const wiring = auditStripeLiveSmokeWiring(process.cwd());
  const wiringOnly = process.argv.includes("--wiring-only");

  let liveSmoke: StripeLiveSmokeSummary | null = null;
  if (!wiringOnly) {
    console.log("\n→ npm run smoke:stripe-live\n");
    try {
      liveSmoke = await runStripeLiveSmoke();
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

  const summary = buildStripeLiveSmokeEra86Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    liveSmoke: liveSmoke ? mapLiveSmoke(liveSmoke) : null,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatStripeLiveSmokeEra86ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${STRIPE_LIVE_SMOKE_ERA86_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
