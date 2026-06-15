/**
 * Era 16 operational sign-off cert script.
 * Validates pack structure and writes template summary artifact for CI wiring.
 */
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
  type OperationalSignOffStep,
} from "../lib/operations/operational-signoff-summary";

export function validateOperationalSignOffPackStructure(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (OPERATIONAL_SIGNOFF_ERA16_SUBSYSTEMS.length !== 2) {
    errors.push("Expected KDS + production calendar subsystems");
  }
  for (const subsystem of OPERATIONAL_SIGNOFF_ERA16_SUBSYSTEMS) {
    if (!subsystem.smokeScript.startsWith("smoke:")) {
      errors.push(`Invalid smoke script for ${subsystem.id}`);
    }
    if (!subsystem.manualDoc.startsWith("docs/")) {
      errors.push(`Invalid manual doc for ${subsystem.id}`);
    }
  }
  return { ok: errors.length === 0, errors };
}

function main() {
  const validation = validateOperationalSignOffPackStructure();

  const templateSteps: OperationalSignOffStep[] = OPERATIONAL_SIGNOFF_ERA16_SUBSYSTEMS.flatMap(
    (subsystem) => [
      {
        id: `${subsystem.id}_ci_certs`,
        label: `${subsystem.label} CI certs`,
        status: "SKIPPED" as const,
        reason: "Cert script — run npm run smoke:operational-signoff-era16 for live results",
      },
      {
        id: `${subsystem.id}_manual_staging`,
        label: `${subsystem.label} manual staging UI`,
        status: "SKIPPED" as const,
        reason: "Set OPERATIONAL_SIGNOFF_STAGING_URL + OPERATIONAL_SIGNOFF_OPERATOR_EMAIL",
      },
    ],
  );

  const summary = buildOperationalSignOffSummary(
    templateSteps,
    buildOperationalSignOffTemplate({}, false),
  );

  const artifactPath = join(process.cwd(), OPERATIONAL_SIGNOFF_ERA16_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`\nOperational sign-off cert (${OPERATIONAL_SIGNOFF_ERA16_POLICY_ID})\n`);
  console.log(`Subsystems: ${OPERATIONAL_SIGNOFF_ERA16_SUBSYSTEMS.map((s) => s.id).join(", ")}`);
  console.log(`Summary artifact: ${OPERATIONAL_SIGNOFF_ERA16_SUMMARY_ARTIFACT}\n`);

  if (!validation.ok) {
    console.error("Pack validation failed:");
    for (const error of validation.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }
}

main();
