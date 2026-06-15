/**
 * Audit marketplace empty states P2-123 wiring.
 *
 * Usage:
 *   npm run audit:marketplace-empty-states-p2-123
 */
import {
  auditMarketplaceEmptyStatesP2_123,
  formatMarketplaceEmptyStatesP2_123AuditLines,
} from "@/lib/marketplace/marketplace-empty-states-p2-123-audit";

function main(): void {
  const summary = auditMarketplaceEmptyStatesP2_123();

  console.log("");
  for (const line of formatMarketplaceEmptyStatesP2_123AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Marketplace empty states P2-123 audit OK");
}

main();
