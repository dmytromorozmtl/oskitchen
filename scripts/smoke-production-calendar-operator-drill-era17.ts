/**
 * Era 17 production calendar operator drill orchestrator.
 *
 * Wiring cert + staging prerequisites + health + manual attestation.
 * Missing secrets → SKIPPED WITH REASON (exit 0). Real failures → FAILED (exit 1).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_CYCLE_RUNBOOK_STEPS,
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_LEGACY_SMOKE,
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_POLICY_ID,
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_SUMMARY_ARTIFACT,
} from "../lib/production/production-calendar-operator-drill-era17-policy";
import { PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_POLICY_ID } from "../lib/production/production-calendar-operator-depth-era15-policy";
import {
  buildProductionCalendarOperatorDrillSummary,
  formatMissingProductionCalendarOperatorDrillEnvVarsReason,
  formatProductionCalendarOperatorDrillReportLines,
  listMissingProductionCalendarOperatorDrillEnvVars,
  normalizeProductionCalendarDrillManualAttestation,
  type ProductionCalendarOperatorDrillStep,
} from "../lib/production/production-calendar-operator-drill-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function readInput() {
  return {
    stagingUrl: process.env.PRODUCTION_CALENDAR_DRILL_STAGING_URL ?? null,
    operatorEmail: process.env.PRODUCTION_CALENDAR_DRILL_OPERATOR_EMAIL ?? null,
    manualAttestation: process.env.PRODUCTION_CALENDAR_DRILL_MANUAL ?? null,
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
  summary: ReturnType<typeof buildProductionCalendarOperatorDrillSummary>,
): void {
  const path = join(process.cwd(), PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(
    `\nProduction calendar operator smoke (${PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_POLICY_ID})\n`,
  );
  console.log(`Era 17 operator drill (${PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_POLICY_ID})\n`);
  for (const [index, step] of PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/production-calendar-operator-checklist.md\n");
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 17 production calendar operator drill

  (default)         Wiring cert + prerequisites + optional health + manual attestation
  --checklist-only  Print Era 17 operator drill runbook steps
  --skip-health     Skip live GET /api/health when PRODUCTION_CALENDAR_DRILL_STAGING_URL is set
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  const steps: ProductionCalendarOperatorDrillStep[] = [];
  const input = readInput();
  const missingEnvVars = listMissingProductionCalendarOperatorDrillEnvVars(input);
  const skipReason = formatMissingProductionCalendarOperatorDrillEnvVarsReason(missingEnvVars);
  const manualAttestation = normalizeProductionCalendarDrillManualAttestation(
    input.manualAttestation,
  );
  const prerequisitesMet = missingEnvVars.length === 0;

  console.log(`\n→ npm run ${PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_LEGACY_SMOKE}\n`);
  const wiringCode = runNpmScript(PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_LEGACY_SMOKE);
  steps.push({
    id: "wiring_cert",
    label: "Production calendar wiring cert (smoke:production-calendar)",
    status: wiringCode === 0 ? "PASSED" : "FAILED",
    reason: wiringCode === 0 ? undefined : `exit ${wiringCode}`,
  });

  if (!prerequisitesMet) {
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
      label: "Manual operator checklist attested on staging",
      status: "SKIPPED",
      reason: skipReason,
    });
  } else {
    steps.push({
      id: "staging_secrets",
      label: "Staging URL + operator email configured",
      status: "PASSED",
      reason: `${input.stagingUrl} / ${input.operatorEmail}`,
    });

    if (process.argv.includes("--skip-health")) {
      steps.push({
        id: "staging_health",
        label: "Staging /api/health reachable",
        status: "SKIPPED",
        reason: "--skip-health",
      });
    } else {
      const health = await checkStagingHealth(
        process.env.PRODUCTION_CALENDAR_DRILL_STAGING_URL!.trim(),
      );
      steps.push({
        id: "staging_health",
        label: "Staging /api/health reachable",
        status: health.ok ? "PASSED" : "FAILED",
        reason: health.reason,
      });
    }

    steps.push({
      id: "manual_attestation",
      label: "Manual operator checklist attested on staging",
      status: manualAttestation === "passed" ? "PASSED" : "SKIPPED",
      reason:
        manualAttestation === "passed"
          ? "PRODUCTION_CALENDAR_DRILL_MANUAL=passed"
          : "Complete manual checklist on staging; set PRODUCTION_CALENDAR_DRILL_MANUAL=passed",
    });
  }

  const summary = buildProductionCalendarOperatorDrillSummary(steps, {
    commitSha: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    missingEnvVars,
    stagingUrl: input.stagingUrl,
    operatorEmail: input.operatorEmail,
    manualAttestation: prerequisitesMet ? manualAttestation : "skipped",
  });
  writeSummaryArtifact(summary);

  console.log(
    `\nProduction calendar operator drill (${PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_POLICY_ID})\n`,
  );
  for (const line of formatProductionCalendarOperatorDrillReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_SUMMARY_ARTIFACT}\n`);

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
