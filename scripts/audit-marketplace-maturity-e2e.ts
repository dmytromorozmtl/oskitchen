/**
 * Audit Marketplace maturity E2E wiring (buyer → cart → PO → fulfill → payout).
 *
 * Usage:
 *   npm run audit:marketplace-maturity-e2e
 */
import {
  auditMarketplaceMaturityE2E,
  formatMarketplaceMaturityE2EAuditLines,
} from "@/lib/marketplace/marketplace-maturity-e2e-audit";

function main(): void {
  const summary = auditMarketplaceMaturityE2E();

  console.log("");
  for (const line of formatMarketplaceMaturityE2EAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Marketplace maturity E2E audit OK");
}

main();
