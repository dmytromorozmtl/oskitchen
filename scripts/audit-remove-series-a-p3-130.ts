/**
 * Audit external Series A references (Blueprint P3-130).
 *
 * Usage:
 *   npm run audit:remove-series-a-p3-130
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  auditRemoveSeriesA,
  formatRemoveSeriesAAuditLines,
} from "@/lib/pm/remove-series-a-p3-130-audit";
import {
  auditExternalSeriesAReferences,
  buildSeriesAReferenceAuditArtifact,
} from "@/lib/pm/remove-series-a-p3-130-operations";

function main(): void {
  const root = process.cwd();
  const external = auditExternalSeriesAReferences(root);
  const artifact = buildSeriesAReferenceAuditArtifact(root);

  writeFileSync(
    join(root, "artifacts/series-a-reference-audit.json"),
    `${JSON.stringify(artifact, null, 2)}\n`,
  );

  const summary = auditRemoveSeriesA(root);

  console.log("");
  for (const line of formatRemoveSeriesAAuditLines(summary)) {
    console.log(line);
  }

  const dirty = external.results.filter((result) => !result.clean);
  if (dirty.length > 0) {
    console.log("");
    for (const result of dirty) {
      console.log(`VIOLATION ${result.path}:`);
      for (const violation of result.violations) {
        console.log(`  - ${violation}`);
      }
    }
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Remove Series A references audit OK");
}

main();
