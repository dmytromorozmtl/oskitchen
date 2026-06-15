/**
 * Audit vendor price intelligence (Blueprint P2-100).
 *
 * Usage:
 *   npm run audit:vendor-price-intelligence-p2-100
 */
import {
  auditVendorPriceIntelligenceP2_100,
  formatVendorPriceIntelligenceP2_100AuditLines,
} from "@/lib/inventory/vendor-price-intelligence-p2-100-audit";

function main(): void {
  const summary = auditVendorPriceIntelligenceP2_100();

  console.log("");
  for (const line of formatVendorPriceIntelligenceP2_100AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Vendor price intelligence (P2-100) audit OK");
}

main();
