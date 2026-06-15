/**
 * Era 17 staging workflows first green orchestrator.
 *
 * Extends Era 16 wiring cert + staging health with GitHub run URL recording.
 * Missing secrets → SKIPPED WITH REASON (exit 0). Real failures → FAILED (exit 1).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  STAGING_WORKFLOWS_FIRST_GREEN_ERA17_CYCLE_RUNBOOK_STEPS,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA17_LEGACY_SMOKE,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA17_POLICY_ID,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA17_SUMMARY_ARTIFACT,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA17_TRACKED_WORKFLOWS,
} from "../lib/ci/staging-workflows-first-green-era17-policy";
import { STAGING_WORKFLOWS_FIRST_GREEN_ERA16_POLICY_ID } from "../lib/ci/staging-workflows-first-green-era16-policy";
import {
  buildStagingWorkflowFirstGreenSummary,
  buildStagingWorkflowGitHubRunRecords,
  evaluateStagingWorkflowFirstGreenPrerequisites,
  formatMissingStagingWorkflowFirstGreenEnvVarsReason,
  formatStagingWorkflowFirstGreenReportLines,
  listMissingStagingWorkflowFirstGreenEnvVars,
  type StagingWorkflowFirstGreenStep,
} from "../lib/ci/staging-workflows-first-green-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function resolveLoginPassword(): string | undefined {
  return (
    process.env.E2E_LOGIN_PASSWORD?.trim() ||
    process.env.E2E_PASSWORD?.trim() ||
    undefined
  );
}

function readPrerequisiteInput() {
  return {
    stagingBaseUrl: process.env.E2E_STAGING_BASE_URL ?? null,
    loginEmail: process.env.E2E_LOGIN_EMAIL ?? null,
    loginPassword: resolveLoginPassword() ?? null,
  };
}

function readGitHubEvidenceFromEnv() {
  return buildStagingWorkflowGitHubRunRecords(
    STAGING_WORKFLOWS_FIRST_GREEN_ERA17_TRACKED_WORKFLOWS.map((entry) => ({
      workflowId: entry.id,
      label: entry.label,
      runUrl: process.env[entry.runUrlEnv] ?? null,
      outcome: process.env[entry.outcomeEnv] ?? null,
    })),
  );
}

async function checkStagingHealth(baseUrl: string): Promise<{ ok: boolean; reason?: string }> {
  const url = `${baseUrl.replace(/\/$/, "")}/api/health`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) {
      return { ok: false, reason: `GET ${url} returned ${response.status}` };
    }
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, reason: `GET ${url} failed: ${message}` };
  }
}

function writeSummaryArtifact(
  summary: ReturnType<typeof buildStagingWorkflowFirstGreenSummary>,
): void {
  const path = join(process.cwd(), STAGING_WORKFLOWS_FIRST_GREEN_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nStaging workflows first green (${STAGING_WORKFLOWS_FIRST_GREEN_ERA16_POLICY_ID})\n`);
  console.log(`Era 17 proof path (${STAGING_WORKFLOWS_FIRST_GREEN_ERA17_POLICY_ID})\n`);
  for (const [index, step] of STAGING_WORKFLOWS_FIRST_GREEN_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/GITHUB_E2E_STAGING_SECRETS.md\n");
}

function buildGitHubWorkflowSteps(
  githubRuns: ReturnType<typeof buildStagingWorkflowGitHubRunRecords>,
  prerequisitesMet: boolean,
  skipReason: string,
): StagingWorkflowFirstGreenStep[] {
  if (!prerequisitesMet) {
    return STAGING_WORKFLOWS_FIRST_GREEN_ERA17_TRACKED_WORKFLOWS.map((entry) => ({
      id: `github_${entry.id}`,
      label: `${entry.label} GitHub run recorded`,
      status: "SKIPPED" as const,
      reason: skipReason,
    }));
  }

  const steps: StagingWorkflowFirstGreenStep[] = [];
  for (const record of githubRuns) {
    if (!record.runUrl && !record.outcome) {
      steps.push({
        id: `github_${record.workflowId}`,
        label: `${record.label} GitHub run recorded`,
        status: "SKIPPED",
        reason: `Set ${STAGING_WORKFLOWS_FIRST_GREEN_ERA17_TRACKED_WORKFLOWS.find((w) => w.id === record.workflowId)?.runUrlEnv} and outcome env after workflow_dispatch.`,
      });
      continue;
    }
    if (!record.runUrl) {
      steps.push({
        id: `github_${record.workflowId}`,
        label: `${record.label} GitHub run recorded`,
        status: "SKIPPED",
        reason: "Run URL missing — operator must record GitHub Actions run URL.",
      });
      continue;
    }
    if (record.outcome === "PASSED") {
      steps.push({
        id: `github_${record.workflowId}`,
        label: `${record.label} GitHub run recorded`,
        status: "PASSED",
        reason: record.runUrl,
      });
    } else if (record.outcome === "FAILED") {
      steps.push({
        id: `github_${record.workflowId}`,
        label: `${record.label} GitHub run recorded`,
        status: "FAILED",
        reason: record.runUrl,
      });
    } else {
      steps.push({
        id: `github_${record.workflowId}`,
        label: `${record.label} GitHub run recorded`,
        status: "SKIPPED",
        reason: record.outcome
          ? `${record.runUrl} — outcome ${record.outcome}`
          : "Outcome env missing — set GITHUB_*_RUN_OUTCOME=PASSED|FAILED|SKIPPED.",
      });
    }
  }

  return steps;
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 17 staging workflows first green

  (default)         Wiring cert + prerequisites + optional health + GitHub run evidence
  --checklist-only  Print Era 17 first green runbook steps
  --skip-health     Skip live GET /api/health when E2E_STAGING_BASE_URL is set
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  const steps: StagingWorkflowFirstGreenStep[] = [];
  const prereqInput = readPrerequisiteInput();
  const missingEnvVars = listMissingStagingWorkflowFirstGreenEnvVars(prereqInput);
  const skipReason = formatMissingStagingWorkflowFirstGreenEnvVarsReason(missingEnvVars);

  console.log(`\n→ npm run ${STAGING_WORKFLOWS_FIRST_GREEN_ERA17_LEGACY_SMOKE}\n`);
  const wiringCode = runNpmScript(STAGING_WORKFLOWS_FIRST_GREEN_ERA17_LEGACY_SMOKE);
  steps.push({
    id: "wiring_cert",
    label: "Staging workflow wiring cert (smoke:staging-workflows)",
    status: wiringCode === 0 ? "PASSED" : "FAILED",
    reason: wiringCode === 0 ? undefined : `exit ${wiringCode}`,
  });

  const prereq = evaluateStagingWorkflowFirstGreenPrerequisites(prereqInput);

  if (!prereq.ok) {
    steps.push({
      id: "staging_secrets",
      label: "Staging E2E secrets configured",
      status: "SKIPPED",
      reason: skipReason,
    });
    steps.push({
      id: "staging_health",
      label: "Staging /api/health reachable",
      status: "SKIPPED",
      reason: skipReason,
    });
    steps.push(...buildGitHubWorkflowSteps([], false, skipReason));
  } else {
    steps.push({
      id: "staging_secrets",
      label: "Staging E2E secrets configured",
      status: "PASSED",
    });

    if (process.argv.includes("--skip-health")) {
      steps.push({
        id: "staging_health",
        label: "Staging /api/health reachable",
        status: "SKIPPED",
        reason: "--skip-health",
      });
    } else {
      const health = await checkStagingHealth(process.env.E2E_STAGING_BASE_URL!.trim());
      steps.push({
        id: "staging_health",
        label: "Staging /api/health reachable",
        status: health.ok ? "PASSED" : "FAILED",
        reason: health.reason,
      });
    }

    const githubRuns = readGitHubEvidenceFromEnv();
    steps.push(...buildGitHubWorkflowSteps(githubRuns, true, skipReason));
  }

  const githubRuns = readGitHubEvidenceFromEnv();
  const summary = buildStagingWorkflowFirstGreenSummary(steps, {
    missingEnvVars,
    githubRuns,
  });
  writeSummaryArtifact(summary);

  console.log(`\nStaging workflows first green (${STAGING_WORKFLOWS_FIRST_GREEN_ERA17_POLICY_ID})\n`);
  for (const line of formatStagingWorkflowFirstGreenReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${STAGING_WORKFLOWS_FIRST_GREEN_ERA17_SUMMARY_ARTIFACT}\n`);

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
