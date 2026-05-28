/**
 * Era 17 channel GitHub workflow first green orchestrator (Cycle 9).
 *
 * Validates channel cert wiring + records woo-shopify-staging-smoke.yml GitHub evidence.
 * Missing secrets or GitHub run → SKIPPED WITH REASON (exit 0). Real failures → FAILED (exit 1).
 */
import { existsSync } from "node:fs";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_CYCLE_RUNBOOK_STEPS,
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_NPM_SCRIPT,
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_POLICY_ID,
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_SUMMARY_ARTIFACT,
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_WORKFLOW,
} from "../lib/integrations/channel-github-workflow-first-green-era17-policy";
import { CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID } from "../lib/integrations/channel-live-smoke-era16-policy";
import {
  buildChannelGitHubWorkflowFirstGreenSummary,
  evaluateChannelGitHubWorkflowSecretPrerequisites,
  formatChannelGitHubWorkflowFirstGreenReportLines,
  listMissingChannelGitHubWorkflowSecretEnvVars,
  type ChannelGitHubWorkflowFirstGreenStep,
} from "../lib/integrations/channel-github-workflow-first-green-summary";
import { normalizeGitHubRunOutcome } from "../lib/ci/staging-workflows-first-green-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function writeSummaryArtifact(
  summary: ReturnType<typeof buildChannelGitHubWorkflowFirstGreenSummary>,
): void {
  const path = join(process.cwd(), CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function readPrerequisiteInput() {
  return {
    databaseUrl: process.env.DATABASE_URL ?? null,
    encryptionKey: process.env.ENCRYPTION_KEY ?? null,
    ownerEmail: process.env.CHANNEL_SMOKE_OWNER_EMAIL ?? null,
    connectionId: process.env.CHANNEL_SMOKE_CONNECTION_ID ?? null,
  };
}

function printRunbook(): void {
  console.log(`\nChannel live smoke (${CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID})\n`);
  console.log(`Era 17 GitHub workflow proof (${CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_POLICY_ID})\n`);
  for (const [index, step] of CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md\n");
}

async function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
Era 17 channel GitHub workflow first green

  (default)       Channel cert wiring + GitHub run evidence evaluation
  --checklist-only  Print Cycle 9 runbook steps
`);
    process.exit(0);
  }

  if (hasFlag("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(
    `\n[${CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_NPM_SCRIPT}] ${CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_POLICY_ID}\n`,
  );

  const steps: ChannelGitHubWorkflowFirstGreenStep[] = [];
  const prereqInput = readPrerequisiteInput();
  const missingEnvVars = listMissingChannelGitHubWorkflowSecretEnvVars(prereqInput);
  const secretPrereq = evaluateChannelGitHubWorkflowSecretPrerequisites(prereqInput);

  console.log("\n→ npm run test:ci:channel-golden-path:cert\n");
  const wiringCode = runNpmScript("test:ci:channel-golden-path:cert");
  steps.push({
    id: "wiring_cert",
    label: "Channel golden-path + live smoke cert wiring",
    status: wiringCode === 0 ? "PASSED" : "FAILED",
    reason: wiringCode === 0 ? undefined : `exit ${wiringCode}`,
  });

  const workflowPath = join(process.cwd(), CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_WORKFLOW);
  const workflowExists = existsSync(workflowPath);
  steps.push({
    id: "workflow_file",
    label: "Woo Shopify staging smoke workflow file",
    status: workflowExists ? "PASSED" : "FAILED",
    reason: workflowExists ? undefined : `missing ${CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_WORKFLOW}`,
  });

  steps.push({
    id: "channel_secrets",
    label: "Channel GitHub workflow secrets",
    status: secretPrereq.ok ? "PASSED" : "SKIPPED",
    reason: secretPrereq.ok ? undefined : secretPrereq.reason,
  });

  const githubRunUrl = process.env.GITHUB_WOO_SHOPIFY_STAGING_RUN_URL?.trim() || null;
  const githubOutcome = normalizeGitHubRunOutcome(
    process.env.GITHUB_WOO_SHOPIFY_STAGING_RUN_OUTCOME,
  );

  if (!secretPrereq.ok) {
    steps.push({
      id: "github_run_evidence",
      label: "GitHub woo-shopify-staging-smoke run evidence",
      status: "SKIPPED",
      reason: "Configure channel GitHub secrets before recording workflow_dispatch proof.",
    });
  } else if (!githubRunUrl || !githubOutcome) {
    steps.push({
      id: "github_run_evidence",
      label: "GitHub woo-shopify-staging-smoke run evidence",
      status: "SKIPPED",
      reason:
        "Missing GITHUB_WOO_SHOPIFY_STAGING_RUN_URL or GITHUB_WOO_SHOPIFY_STAGING_RUN_OUTCOME — run workflow_dispatch and record outcome.",
    });
  } else if (githubOutcome === "FAILED") {
    steps.push({
      id: "github_run_evidence",
      label: "GitHub woo-shopify-staging-smoke run evidence",
      status: "FAILED",
      reason: `GitHub outcome FAILED — ${githubRunUrl}`,
    });
  } else {
    steps.push({
      id: "github_run_evidence",
      label: "GitHub woo-shopify-staging-smoke run evidence",
      status: githubOutcome === "PASSED" ? "PASSED" : "SKIPPED",
      reason:
        githubOutcome === "PASSED"
          ? `GitHub PASSED — ${githubRunUrl}`
          : `GitHub SKIPPED — ${githubRunUrl}`,
    });
  }

  const summary = buildChannelGitHubWorkflowFirstGreenSummary(steps, {
    missingEnvVars,
    channelSecretsConfigured: secretPrereq.ok,
    githubRun: {
      workflowPath: CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_WORKFLOW,
      runUrl: githubRunUrl,
      outcome: githubOutcome,
    },
  });
  writeSummaryArtifact(summary);

  for (const line of formatChannelGitHubWorkflowFirstGreenReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_SUMMARY_ARTIFACT}\n`);

  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
