/**
 * Audit marketplace comparison tool P2-124 wiring.
 *
 * Usage:
 *   npm run audit:marketplace-comparison-p2-124
 */
import {
  auditMarketplaceComparisonP2_124,
  formatMarketplaceComparisonP2_124AuditLines,
} from "@/lib/marketplace/marketplace-comparison-p2-124-audit";

function main(): void {
  const summary = auditMarketplaceComparisonP2_124();

  console.log("");
  for (const line of formatMarketplaceComparisonP2_124AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Marketplace comparison tool P2-124 audit OK");
}

main();
