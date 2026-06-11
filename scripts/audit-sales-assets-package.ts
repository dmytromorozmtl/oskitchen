/**
 * Audit sales assets package (Blueprint P1-82).
 *
 * Usage:
 *   npm run audit:sales-assets-package
 */
import {
  auditSalesAssetsPackage,
  formatSalesAssetsPackageAuditLines,
} from "@/lib/marketing/sales-assets-package-audit";

function main(): void {
  const summary = auditSalesAssetsPackage();

  console.log("");
  for (const line of formatSalesAssetsPackageAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Sales assets package audit OK");
}

main();
