/**
 * Audit pricing SKU PM baseline (Blueprint P3-135).
 *
 * Usage:
 *   npm run audit:pricing-sku-p3-135
 */
import {
  auditPricingSkuP3_135,
  formatPricingSkuP3_135AuditLines,
} from "@/lib/pm/pricing-sku-p3-135-audit";

function main(): void {
  const summary = auditPricingSkuP3_135();

  console.log("");
  for (const line of formatPricingSkuP3_135AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Pricing SKU PM audit OK");
}

main();
