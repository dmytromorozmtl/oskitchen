/**
 * Era 17 operational sign-off staging proof orchestrator.
 *
 * Extends Era 16 sign-off smoke with staging URL, operator identity, and health check.
 * Missing env → SKIPPED WITH REASON (exit 0). Real failures → FAILED (exit 1).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_CYCLE_RUNBOOK_STEPS,
  OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_LEGACY_SMOKE,
  OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_POLICY_ID,
  OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_SUMMARY_ARTIFACT,
} from "../lib/operations/operational-signoff-staging-proof-era17-policy";
import { OPERATIONAL_SIGNOFF_ERA16_POLICY_ID } from "../lib/operations/operational-signoff-era16-policy";
import {
  buildOperationalSignOffStagingProofSummary,
  evaluateOperationalSignOffStagingProofPrerequisites,
  formatMissingOperationalSignOffStagingProofEnvVarsReason,
  formatOperationalSignOffStagingProofReportLines,
  listMissingOperationalSignOffStagingProofEnvVars,
  normalizeManualSignOffState,
  type OperationalSignOffStagingProofStep,
} from "../lib/operations/operational-signoff-staging-proof-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function readPrerequisiteInput() {
  return {
    stagingUrl: process.env.OPERATIONAL_SIGNOFF_STAGING_URL ?? null,
    operatorEmail: process.env.OPERATIONAL_SIGNOFF_OPERATOR_EMAIL ?? null,
    kdsManual: process.env.OPERATIONAL_SIGNOFF_KDS_MANUAL ?? null,
    productionCalendarManual: process.env.OPERATIONAL_SIGNOFF_PRODUCTION_CALENDAR_MANUAL ?? null,
  };
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
  summary: ReturnType<typeof buildOperationalSignOffStagingProofSummary>,
): void {
  const path = join(process.cwd(), OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nOperational sign-off (${OPERATIONAL_SIGNOFF_ERA16_POLICY_ID})\n`);
  console.log(`Era 17 staging proof (${OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_POLICY_ID})\n`);
  for (const [index, step] of OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(
    "\nSee docs/kds-staging-smoke-checklist.md and docs/production-calendar-operator-checklist.md\n",
  );
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 17 operational sign-off staging proof

  (default)         Wiring cert + prerequisites + optional health + manual attestation
  --checklist-only  Print Era 17 staging sign-off runbook steps
  --skip-health     Skip live GET /api/health when OPERATIONAL_SIGNOFF_STAGING_URL is set
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  const steps: OperationalSignOffStagingProofStep[] = [];
  const prereqInput = readPrerequisiteInput();
  const missingEnvVars = listMissingOperationalSignOffStagingProofEnvVars(prereqInput);
  const skipReason = formatMissingOperationalSignOffStagingProofEnvVarsReason(missingEnvVars);
  const kdsManual = normalizeManualSignOffState(prereqInput.kdsManual);
  const productionCalendarManual = normalizeManualSignOffState(
    prereqInput.productionCalendarManual,
  );

  console.log(`\n→ npm run ${OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_LEGACY_SMOKE}\n`);
  const wiringCode = runNpmScript(OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_LEGACY_SMOKE);
  steps.push({
    id: "wiring_cert",
    label: "Operational sign-off wiring cert (smoke:operational-signoff-era16)",
    status: wiringCode === 0 ? "PASSED" : "FAILED",
    reason: wiringCode === 0 ? undefined : `exit ${wiringCode}`,
  });

  const prereq = evaluateOperationalSignOffStagingProofPrerequisites(prereqInput);

  if (!prereq.ok) {
    steps.push({
      id: "staging_secrets",
      label: "Staging URL + operator email configured",
      status: "SKIPPED",
      reason: skipReason,
    });
    steps.push({
      id: "staging_health",
      label: "Staging /api/health reachable",
      status: "SKIPPED",
      reason: skipReason,
    });
    steps.push({
      id: "manual_attestation",
      label: "KDS + production calendar manual sign-off attested",
      status: "SKIPPED",
      reason: skipReason,
    });
  } else {
    steps.push({
      id: "staging_secrets",
      label: "Staging URL + operator email configured",
      status: "PASSED",
      reason: `${prereqInput.stagingUrl} / ${prereqInput.operatorEmail}`,
    });

    if (process.argv.includes("--skip-health")) {
      steps.push({
        id: "staging_health",
        label: "Staging /api/health reachable",
        status: "SKIPPED",
        reason: "--skip-health",
      });
    } else {
      const health = await checkStagingHealth(process.env.OPERATIONAL_SIGNOFF_STAGING_URL!.trim());
      steps.push({
        id: "staging_health",
        label: "Staging /api/health reachable",
        status: health.ok ? "PASSED" : "FAILED",
        reason: health.reason,
      });
    }

    const manualPassed =
      kdsManual === "passed" && productionCalendarManual === "passed";
    steps.push({
      id: "manual_attestation",
      label: "KDS + production calendar manual sign-off attested",
      status: manualPassed ? "PASSED" : "SKIPPED",
      reason: manualPassed
        ? "Both manual checklists attested passed"
        : "Complete manual checklists on staging; set OPERATIONAL_SIGNOFF_KDS_MANUAL=passed and OPERATIONAL_SIGNOFF_PRODUCTION_CALENDAR_MANUAL=passed",
    });
  }

  const summary = buildOperationalSignOffStagingProofSummary(steps, {
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    missingEnvVars,
    stagingUrl: prereqInput.stagingUrl,
    operatorEmail: prereqInput.operatorEmail,
    kdsManual: prereq.ok ? kdsManual : "skipped",
    productionCalendarManual: prereq.ok ? productionCalendarManual : "skipped",
  });
  writeSummaryArtifact(summary);

  console.log(
    `\nOperational sign-off staging proof (${OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_POLICY_ID})\n`,
  );
  for (const line of formatOperationalSignOffStagingProofReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_SUMMARY_ARTIFACT}\n`);

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
