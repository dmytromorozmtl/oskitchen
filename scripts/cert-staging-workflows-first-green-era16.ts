/**
 * Era 16 staging workflows first green cert script.
 */
import {
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_OPTIONAL_WORKFLOWS,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_POLICY_ID,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_SUMMARY_ARTIFACT,
} from "../lib/ci/staging-workflows-first-green-era16-policy";

export function validateStagingWorkflowFirstGreenPack(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (STAGING_WORKFLOWS_FIRST_GREEN_ERA16_OPTIONAL_WORKFLOWS.length < 4) {
    errors.push("Expected at least four optional staging workflow paths");
  }
  return { ok: errors.length === 0, errors };
}

function main() {
  const validation = validateStagingWorkflowFirstGreenPack();

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
