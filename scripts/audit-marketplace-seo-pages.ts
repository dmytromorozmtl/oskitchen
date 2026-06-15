/**
 * Audit marketplace SEO pages P2-125 wiring.
 *
 * Usage:
 *   npm run audit:marketplace-seo-pages
 */
import {
  auditMarketplaceSeoPages,
  formatMarketplaceSeoPagesAuditLines,
} from "@/lib/marketing/marketplace-seo-pages-audit";

function main(): void {
  const summary = auditMarketplaceSeoPages();

  console.log("");
  for (const line of formatMarketplaceSeoPagesAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Marketplace SEO pages audit OK");
}

main();
