/**
 * Era 16 operational sign-off smoke orchestrator.
 *
 * Runs KDS + production calendar CI smokes and writes operational-signoff-summary.json.
 * Manual staging UI steps are SKIPPED WITH REASON unless operator env vars are set.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  OPERATIONAL_SIGNOFF_ERA16_POLICY_ID,
  OPERATIONAL_SIGNOFF_ERA16_SUBSYSTEMS,
  OPERATIONAL_SIGNOFF_ERA16_SUMMARY_ARTIFACT,
} from "../lib/operations/operational-signoff-era16-policy";
import {
  buildOperationalSignOffSummary,
  buildOperationalSignOffTemplate,
  evaluateOperationalSignOffManualPrerequisites,
  formatOperationalSignOffSummaryLines,
  type OperationalSignOffStep,
} from "../lib/operations/operational-signoff-summary";

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function readManualInput() {
  return {
    stagingUrl: process.env.OPERATIONAL_SIGNOFF_STAGING_URL ?? null,
    operatorEmail: process.env.OPERATIONAL_SIGNOFF_OPERATOR_EMAIL ?? null,
    pilotTenantId: process.env.OPERATIONAL_SIGNOFF_PILOT_TENANT_ID ?? null,
    commitSha: process.env.OPERATIONAL_SIGNOFF_COMMIT_SHA ?? process.env.GITHUB_SHA ?? null,
    notes: process.env.OPERATIONAL_SIGNOFF_NOTES ?? null,
  };
}

function runNpmScript(script: string): { exitCode: number; output: string } {
  const result = spawnSync("npm", ["run", script], {
    encoding: "utf8",
    env: process.env,
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  return { exitCode: result.status ?? 1, output };
}

function buildSteps(
  skipCi: boolean,
  manualReady: boolean,
  manualSkipReason: string,
  smokeResults: Map<string, { exitCode: number; output: string }>,
): OperationalSignOffStep[] {
  const steps: OperationalSignOffStep[] = [];

  for (const subsystem of OPERATIONAL_SIGNOFF_ERA16_SUBSYSTEMS) {
    const ciStepId = `${subsystem.id}_ci_certs`;
    if (skipCi) {
      steps.push({
        id: ciStepId,
        label: `${subsystem.label} CI certs`,
        status: "SKIPPED",
        reason: "--skip-ci flag set",
      });
    } else {
      const result = smokeResults.get(subsystem.smokeScript);
      if (!result) {
        steps.push({
          id: ciStepId,
          label: `${subsystem.label} CI certs`,
          status: "FAILED",
          reason: "Smoke script did not run",
        });
      } else if (result.exitCode === 0) {
        steps.push({
          id: ciStepId,
          label: `${subsystem.label} CI certs`,
          status: "PASSED",
          reason: subsystem.policyId,
        });
      } else {
        steps.push({
          id: ciStepId,
          label: `${subsystem.label} CI certs`,
          status: "FAILED",
          reason: `${subsystem.smokeScript} exited ${result.exitCode}`,
        });
      }
    }

    const manualStepId = `${subsystem.id}_manual_staging`;
    if (manualReady) {
      steps.push({
        id: manualStepId,
        label: `${subsystem.label} manual staging UI`,
        status: "SKIPPED",
        reason:
          "Operator must complete manual checklist on staging and update signOffTemplate fields in artifact",
      });
    } else {
      steps.push({
        id: manualStepId,
        label: `${subsystem.label} manual staging UI`,
        status: "SKIPPED",
        reason: manualSkipReason,
      });
    }
  }

  return steps;
}

function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
Era 16 operational sign-off smoke

  (default)   Run smoke:kds-staging + smoke:production-calendar; write summary artifact
  --skip-ci   Skip CI cert smokes (write template-only summary)
  --dry-run   Print planned steps without running smokes

Env (optional — manual staging sign-off):
  OPERATIONAL_SIGNOFF_STAGING_URL
  OPERATIONAL_SIGNOFF_OPERATOR_EMAIL
  OPERATIONAL_SIGNOFF_PILOT_TENANT_ID
  OPERATIONAL_SIGNOFF_COMMIT_SHA
`);
    process.exit(0);
  }

  const manualInput = readManualInput();
  const manualCheck = evaluateOperationalSignOffManualPrerequisites(manualInput);
  const manualReady = manualCheck.ok;
  const manualSkipReason = manualCheck.ok ? "" : manualCheck.reason;

  const skipCi = hasFlag("--skip-ci");
  const dryRun = hasFlag("--dry-run");

  const smokeResults = new Map<string, { exitCode: number; output: string }>();

  if (!skipCi && !dryRun) {
    for (const subsystem of OPERATIONAL_SIGNOFF_ERA16_SUBSYSTEMS) {
      console.log(`\n[operational-signoff] Running ${subsystem.smokeScript}...\n`);
      smokeResults.set(subsystem.smokeScript, runNpmScript(subsystem.smokeScript));
    }
  }

  const steps = buildSteps(skipCi, manualReady, manualSkipReason, smokeResults);
  const signOffTemplate = buildOperationalSignOffTemplate(manualInput, manualReady);
  const summary = buildOperationalSignOffSummary(steps, signOffTemplate);

  if (dryRun) {
    for (const line of formatOperationalSignOffSummaryLines(summary)) {
      console.log(line);
    }
    process.exit(0);
  }

  const artifactPath = join(process.cwd(), OPERATIONAL_SIGNOFF_ERA16_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`\nOperational sign-off (${OPERATIONAL_SIGNOFF_ERA16_POLICY_ID})\n`);
  for (const line of formatOperationalSignOffSummaryLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${OPERATIONAL_SIGNOFF_ERA16_SUMMARY_ARTIFACT}\n`);

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
