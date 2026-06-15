/**
 * Audit marketplace commission model (Blueprint P2-118).
 *
 * Usage:
 *   npm run audit:marketplace-commission-model-p2-118
 */
import {
  auditMarketplaceCommissionModelP2_118,
  formatMarketplaceCommissionModelP2_118AuditLines,
} from "@/lib/marketplace/marketplace-commission-model-p2-118-audit";

function main(): void {
  const summary = auditMarketplaceCommissionModelP2_118();

  console.log("");
  for (const line of formatMarketplaceCommissionModelP2_118AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Marketplace commission model (P2-118) audit OK");
}

main();
