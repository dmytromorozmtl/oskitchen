/**
 * Era 16 staging workflows first green orchestrator.
 *
 * 1. Wiring cert via smoke:staging-workflows
 * 2. Optional staging /api/health when E2E_STAGING_BASE_URL set
 * Missing secrets → SKIPPED WITH REASON (exit 0). Real failures → FAILED (exit 1).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_LEGACY_SMOKE,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_POLICY_ID,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_PILOT_RUNBOOK_STEPS,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_SUMMARY_ARTIFACT,
} from "../lib/ci/staging-workflows-first-green-era16-policy";
import {
  buildStagingWorkflowFirstGreenSummary,
  evaluateStagingWorkflowFirstGreenPrerequisites,
  formatStagingWorkflowFirstGreenReportLines,
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
  const path = join(process.cwd(), STAGING_WORKFLOWS_FIRST_GREEN_ERA16_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nStaging workflows first green (${STAGING_WORKFLOWS_FIRST_GREEN_ERA16_POLICY_ID})\n`);
  for (const [index, step] of STAGING_WORKFLOWS_FIRST_GREEN_ERA16_PILOT_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/GITHUB_E2E_STAGING_SECRETS.md\n");
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 16 staging workflows first green

  (default)         Wiring cert + optional staging health check
  --checklist-only  Print first green runbook steps
  --skip-health     Skip live GET /api/health even when E2E_STAGING_BASE_URL is set
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  const steps: StagingWorkflowFirstGreenStep[] = [];

  console.log(`\n→ npm run ${STAGING_WORKFLOWS_FIRST_GREEN_ERA16_LEGACY_SMOKE}\n`);
  const wiringCode = runNpmScript(STAGING_WORKFLOWS_FIRST_GREEN_ERA16_LEGACY_SMOKE);
  steps.push({
    id: "wiring_cert",
    label: "Staging workflow wiring cert (smoke:staging-workflows)",
    status: wiringCode === 0 ? "PASSED" : "FAILED",
    reason: wiringCode === 0 ? undefined : `exit ${wiringCode}`,
  });

  const prereq = evaluateStagingWorkflowFirstGreenPrerequisites({
    stagingBaseUrl: process.env.E2E_STAGING_BASE_URL,
    loginEmail: process.env.E2E_LOGIN_EMAIL,
    loginPassword: resolveLoginPassword(),
  });

  if (!prereq.ok) {
    steps.push({
      id: "staging_secrets",
      label: "Staging E2E secrets configured",
      status: "SKIPPED",
      reason: prereq.reason,
    });
    steps.push({
      id: "staging_health",
      label: "Staging /api/health reachable",
      status: "SKIPPED",
      reason: prereq.reason,
    });
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
  }

  steps.push({
    id: "github_first_green",
    label: "GitHub workflow_dispatch first green recorded",
    status: "SKIPPED",
    reason:
      "Operator must run E2E Staging / KDS Staging workflows in GitHub Actions and record artifact outcome — not automatable from local smoke alone.",
  });

  const summary = buildStagingWorkflowFirstGreenSummary(steps);
  writeSummaryArtifact(summary);

  console.log(`\nStaging workflows first green (${STAGING_WORKFLOWS_FIRST_GREEN_ERA16_POLICY_ID})\n`);
  for (const line of formatStagingWorkflowFirstGreenReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${STAGING_WORKFLOWS_FIRST_GREEN_ERA16_SUMMARY_ARTIFACT}\n`);

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
