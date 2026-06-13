/**
 * Audit P1-30 pricing page — public Design Partner tier.
 *
 * Usage:
 *   npm run audit:pricing-page
 */
import {
  auditPricingPageP130,
  formatPricingPageP130AuditLines,
} from "@/lib/marketing/pricing-page-p1-30-audit";

function main(): void {
  const summary = auditPricingPageP130();

  console.log("");
  for (const line of formatPricingPageP130AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Pricing page P1-30 audit OK");
}

main();
