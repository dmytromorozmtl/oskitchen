/**
 * Audit nav preview labels PM baseline (Blueprint P3-133).
 *
 * Usage:
 *   npm run audit:nav-audit-preview-labels-p3-133
 */
import {
  auditNavAuditPreviewLabelsPm,
  formatNavAuditPreviewLabelsPmAuditLines,
} from "@/lib/pm/nav-audit-preview-labels-p3-133-audit";

function main(): void {
  const summary = auditNavAuditPreviewLabelsPm();

  console.log("");
  for (const line of formatNavAuditPreviewLabelsPmAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Nav audit preview labels PM OK");
}

main();
