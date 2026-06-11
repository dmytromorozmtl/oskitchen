/**
 * Audit Marketplace cart → PO → fulfill E2E wiring.
 *
 * Usage:
 *   npm run audit:marketplace-cart-po-fulfill-e2e
 */
import {
  auditMarketplaceCartPoFulfillE2E,
  formatMarketplaceCartPoFulfillAuditLines,
} from "@/lib/marketplace/marketplace-cart-po-fulfill-e2e-audit";

function main(): void {
  const summary = auditMarketplaceCartPoFulfillE2E();

  console.log("");
  for (const line of formatMarketplaceCartPoFulfillAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Marketplace cart → PO → fulfill E2E audit OK");
}

main();
