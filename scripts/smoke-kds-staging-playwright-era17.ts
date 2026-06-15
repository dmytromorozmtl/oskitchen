/**
 * Era 17 KDS staging Playwright proof orchestrator.
 *
 * Wiring cert + staging prerequisites + GitHub run URL recording.
 * Missing secrets → SKIPPED WITH REASON (exit 0). Real failures → FAILED (exit 1).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_CYCLE_RUNBOOK_STEPS,
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_LEGACY_SMOKE,
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_POLICY_ID,
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_SUMMARY_ARTIFACT,
} from "../lib/kitchen/kds-staging-playwright-proof-era17-policy";
import { KDS_STAGING_SMOKE_ERA15_POLICY_ID } from "../lib/kitchen/kds-staging-smoke-era15-policy";
import {
  buildKdsStagingPlaywrightGitHubRunRecord,
  buildKdsStagingPlaywrightProofSummary,
  evaluateKdsStagingPlaywrightProofPrerequisites,
  formatKdsStagingPlaywrightProofReportLines,
  formatMissingKdsStagingPlaywrightProofEnvVarsReason,
  listMissingKdsStagingPlaywrightProofEnvVars,
  type KdsStagingPlaywrightProofStep,
} from "../lib/kitchen/kds-staging-playwright-proof-summary";

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

function readGitHubRunFromEnv() {
  return buildKdsStagingPlaywrightGitHubRunRecord({
    runUrl: process.env.GITHUB_KDS_STAGING_RUN_URL ?? null,
    outcome: process.env.GITHUB_KDS_STAGING_RUN_OUTCOME ?? null,
  });
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
  summary: ReturnType<typeof buildKdsStagingPlaywrightProofSummary>,
): void {
  const path = join(process.cwd(), KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nKDS staging smoke (${KDS_STAGING_SMOKE_ERA15_POLICY_ID})\n`);
  console.log(`Era 17 Playwright proof (${KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_POLICY_ID})\n`);
  for (const [index, step] of KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/kds-staging-smoke-checklist.md and docs/GITHUB_E2E_STAGING_SECRETS.md\n");
}

function buildGitHubStep(
  githubRun: ReturnType<typeof buildKdsStagingPlaywrightGitHubRunRecord>,
  prerequisitesMet: boolean,
  skipReason: string,
): KdsStagingPlaywrightProofStep {
  if (!prerequisitesMet) {
    return {
      id: "github_kds_run",
      label: "Playwright KDS Staging GitHub run recorded",
      status: "SKIPPED",
      reason: skipReason,
    };
  }

  if (!githubRun.runUrl && !githubRun.outcome) {
    return {
      id: "github_kds_run",
      label: "Playwright KDS Staging GitHub run recorded",
      status: "SKIPPED",
      reason:
        "Set GITHUB_KDS_STAGING_RUN_URL and GITHUB_KDS_STAGING_RUN_OUTCOME after workflow_dispatch.",
    };
  }

  if (!githubRun.runUrl) {
    return {
      id: "github_kds_run",
      label: "Playwright KDS Staging GitHub run recorded",
      status: "SKIPPED",
      reason: "Run URL missing — operator must record GitHub Actions run URL.",
    };
  }

  if (githubRun.outcome === "PASSED") {
    return {
      id: "github_kds_run",
      label: "Playwright KDS Staging GitHub run recorded",
      status: "PASSED",
      reason: githubRun.runUrl,
    };
  }

  if (githubRun.outcome === "FAILED") {
    return {
      id: "github_kds_run",
      label: "Playwright KDS Staging GitHub run recorded",
      status: "FAILED",
      reason: githubRun.runUrl,
    };
  }

  return {
    id: "github_kds_run",
    label: "Playwright KDS Staging GitHub run recorded",
    status: "SKIPPED",
    reason: githubRun.outcome
      ? `${githubRun.runUrl} — outcome ${githubRun.outcome}`
      : "Outcome env missing — set GITHUB_KDS_STAGING_RUN_OUTCOME=PASSED|FAILED|SKIPPED.",
  };
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 17 KDS staging Playwright proof

  (default)         Wiring cert + prerequisites + optional health + GitHub run evidence
  --checklist-only  Print Era 17 Playwright proof runbook steps
  --skip-health     Skip live GET /api/health when E2E_STAGING_BASE_URL is set
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  const steps: KdsStagingPlaywrightProofStep[] = [];
  const prereqInput = readPrerequisiteInput();
  const missingEnvVars = listMissingKdsStagingPlaywrightProofEnvVars(prereqInput);
  const skipReason = formatMissingKdsStagingPlaywrightProofEnvVarsReason(missingEnvVars);

  console.log(`\n→ npm run ${KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_LEGACY_SMOKE}\n`);
  const wiringCode = runNpmScript(KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_LEGACY_SMOKE);
  steps.push({
    id: "wiring_cert",
    label: "KDS staging wiring cert (smoke:kds-staging)",
    status: wiringCode === 0 ? "PASSED" : "FAILED",
    reason: wiringCode === 0 ? undefined : `exit ${wiringCode}`,
  });

  const prereq = evaluateKdsStagingPlaywrightProofPrerequisites(prereqInput);
  const githubRun = readGitHubRunFromEnv();

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
    steps.push(buildGitHubStep(githubRun, false, skipReason));
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

    steps.push(buildGitHubStep(githubRun, true, skipReason));
  }

  const summary = buildKdsStagingPlaywrightProofSummary(steps, {
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    missingEnvVars,
    githubRun,
  });
  writeSummaryArtifact(summary);

  console.log(`\nKDS staging Playwright proof (${KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_POLICY_ID})\n`);
  for (const line of formatKdsStagingPlaywrightProofReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_SUMMARY_ARTIFACT}\n`);

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
