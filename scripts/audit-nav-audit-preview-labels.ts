/**
 * Audit nav preview / beta badge labels on sidebar items.
 *
 * Usage:
 *   npm run audit:nav-audit-preview-labels
 */
import {
  auditNavAuditPreviewLabels,
  formatNavAuditPreviewLabelsAuditLines,
} from "@/lib/design/nav-audit-preview-labels-audit";

function main(): void {
  const summary = auditNavAuditPreviewLabels();

  console.log("");
  for (const line of formatNavAuditPreviewLabelsAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (summary.unlabeledBetaHrefs.length > 0) {
    console.log("Unlabeled BETA preview links:");
    for (const href of summary.unlabeledBetaHrefs) {
      console.log(`  - ${href}`);
    }
    console.log("");
  }

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Nav audit preview labels OK");
}

main();
