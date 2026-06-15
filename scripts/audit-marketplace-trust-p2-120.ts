/**
 * Audit marketplace trust system (Blueprint P2-120).
 *
 * Usage:
 *   npm run audit:marketplace-trust-p2-120
 */
import {
  auditMarketplaceTrustP2_120,
  formatMarketplaceTrustP2_120AuditLines,
} from "@/lib/marketplace/marketplace-trust-p2-120-audit";

function main(): void {
  const summary = auditMarketplaceTrustP2_120();

  console.log("");
  for (const line of formatMarketplaceTrustP2_120AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Marketplace trust (P2-120) audit OK");
}

main();
