/**
 * Era 16 mutation registry linter cert script.
 * Writes artifacts/mutation-registry-linter-summary.json for operator review.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  MUTATION_REGISTRY_LINTER_ERA16_POLICY_ID,
  MUTATION_REGISTRY_LINTER_ERA16_SUMMARY_ARTIFACT,
} from "../lib/permissions/mutation-registry-linter-era16-policy";
import {
  buildMutationRegistryLinterSummary,
  scanMutationRegistryCompliance,
} from "../lib/permissions/mutation-registry-linter";

function main() {
  const scan = scanMutationRegistryCompliance();
  const summary = buildMutationRegistryLinterSummary(
    MUTATION_REGISTRY_LINTER_ERA16_POLICY_ID,
    scan,
  );

  const artifactPath = join(process.cwd(), MUTATION_REGISTRY_LINTER_ERA16_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`\nMutation registry linter (${MUTATION_REGISTRY_LINTER_ERA16_POLICY_ID})\n`);
  console.log(`Scanned: ${summary.scannedFiles} action files`);
  console.log(
    `Sensitive mutations: ${summary.sensitiveFiles} (${summary.governedFiles} governed, ${summary.allowlistedFiles} allowlisted)`,
  );

  if (summary.violationCount > 0) {
    console.log("\nUngoverned sensitive action files:");
    for (const violation of summary.violations) {
      console.log(`  - ${violation.path}: ${violation.reason}`);
    }
  }

  console.log(`\nSummary artifact: ${MUTATION_REGISTRY_LINTER_ERA16_SUMMARY_ARTIFACT}\n`);

  if (!scan.ok) {
    process.exit(1);
  }
}

main();
