/**
 * Era 85 Mailchimp LIVE smoke orchestrator — wiring cert + full live path.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  MAILCHIMP_LIVE_SMOKE_ERA85_CYCLE_RUNBOOK_STEPS,
  MAILCHIMP_LIVE_SMOKE_ERA85_NPM_SCRIPT,
  MAILCHIMP_LIVE_SMOKE_ERA85_OPS_DOC,
  MAILCHIMP_LIVE_SMOKE_ERA85_POLICY_ID,
  MAILCHIMP_LIVE_SMOKE_ERA85_SUMMARY_ARTIFACT,
} from "../lib/integrations/mailchimp-live-smoke-era85-policy";
import {
  auditMailchimpLiveSmokeWiring,
  buildMailchimpLiveSmokeEra85Summary,
  formatMailchimpLiveSmokeEra85ReportLines,
} from "../lib/integrations/mailchimp-live-smoke-summary";
import { runMailchimpLiveSmoke, type MailchimpLiveSmokeSummary } from "./smoke-mailchimp-live";
import { loadSmokeEnv } from "./lib/load-smoke-env";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function writeSummary(summary: ReturnType<typeof buildMailchimpLiveSmokeEra85Summary>): void {
  const path = join(process.cwd(), MAILCHIMP_LIVE_SMOKE_ERA85_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nMailchimp live smoke (${MAILCHIMP_LIVE_SMOKE_ERA85_POLICY_ID})\n`);
  for (const [index, step] of MAILCHIMP_LIVE_SMOKE_ERA85_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${MAILCHIMP_LIVE_SMOKE_ERA85_OPS_DOC}\n`);
}

function mapLiveSmoke(live: MailchimpLiveSmokeSummary) {
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
Era 85 Mailchimp LIVE smoke

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
    `\n[${MAILCHIMP_LIVE_SMOKE_ERA85_NPM_SCRIPT}] ${MAILCHIMP_LIVE_SMOKE_ERA85_POLICY_ID}\n`,
  );
  console.log("\n→ npm run test:ci:mailchimp-live-smoke-era85:cert\n");
  const certCode = runNpmScript("test:ci:mailchimp-live-smoke-era85:cert");

  const wiring = auditMailchimpLiveSmokeWiring(process.cwd());
  const wiringOnly = process.argv.includes("--wiring-only");

  let liveSmoke: MailchimpLiveSmokeSummary | null = null;
  if (!wiringOnly) {
    console.log("\n→ npm run smoke:mailchimp-live\n");
    try {
      liveSmoke = await runMailchimpLiveSmoke();
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

  const summary = buildMailchimpLiveSmokeEra85Summary({
    certPassed: certCode === 0,
    wiringFailures: wiring.failures,
    liveSmoke: liveSmoke ? mapLiveSmoke(liveSmoke) : null,
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
  writeSummary(summary);

  for (const line of formatMailchimpLiveSmokeEra85ReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${MAILCHIMP_LIVE_SMOKE_ERA85_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
