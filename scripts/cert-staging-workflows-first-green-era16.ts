/**
 * Era 16 staging workflows first green cert script.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_OPTIONAL_WORKFLOWS,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_POLICY_ID,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_SUMMARY_ARTIFACT,
} from "../lib/ci/staging-workflows-first-green-era16-policy";
import {
  buildStagingWorkflowFirstGreenSummary,
  type StagingWorkflowFirstGreenStep,
} from "../lib/ci/staging-workflows-first-green-summary";

export function validateStagingWorkflowFirstGreenPack(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (STAGING_WORKFLOWS_FIRST_GREEN_ERA16_OPTIONAL_WORKFLOWS.length < 4) {
    errors.push("Expected at least four optional staging workflow paths");
  }
  return { ok: errors.length === 0, errors };
}

function main() {
  const validation = validateStagingWorkflowFirstGreenPack();
  const planSteps: StagingWorkflowFirstGreenStep[] = [
    {
      id: "wiring_cert",
      label: "Staging workflow wiring cert",
      status: "SKIPPED",
      reason: "Report plan only — run npm run smoke:staging-workflows-first-green",
    },
  ];
  const summary = buildStagingWorkflowFirstGreenSummary(planSteps);

  const artifactPath = join(process.cwd(), STAGING_WORKFLOWS_FIRST_GREEN_ERA16_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`\nStaging workflows first green cert (${STAGING_WORKFLOWS_FIRST_GREEN_ERA16_POLICY_ID})\n`);
  console.log(`Optional workflows: ${STAGING_WORKFLOWS_FIRST_GREEN_ERA16_OPTIONAL_WORKFLOWS.length}`);
  console.log(`Summary artifact: ${STAGING_WORKFLOWS_FIRST_GREEN_ERA16_SUMMARY_ARTIFACT}\n`);

  if (!validation.ok) {
    console.error("First green pack validation failed:");
    for (const error of validation.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }
}

main();
