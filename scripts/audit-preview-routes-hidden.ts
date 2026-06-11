/**
 * Audit preview/hidden dashboard routes guarded by middleware redirect.
 *
 * Usage:
 *   npm run audit:preview-routes-hidden
 */
import {
  auditPreviewRoutesHidden,
  formatPreviewRouteAuditLines,
} from "@/lib/navigation/preview-route-audit";

function main(): void {
  const summary = auditPreviewRoutesHidden();

  console.log("");
  for (const line of formatPreviewRouteAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Preview route guard audit OK");
}

main();
