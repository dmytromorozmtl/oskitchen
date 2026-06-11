/**
 * Audit marketplace empty states design (illustration + value prop + CTA).
 *
 * Usage:
 *   npm run audit:marketplace-empty-states-design
 */
import {
  auditMarketplaceEmptyStatesDesign,
  formatMarketplaceEmptyStatesDesignAuditLines,
} from "@/lib/design/marketplace-empty-states-design-audit";

function main(): void {
  const summary = auditMarketplaceEmptyStatesDesign();

  console.log("");
  for (const line of formatMarketplaceEmptyStatesDesignAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Marketplace empty states design audit OK");
}

main();
