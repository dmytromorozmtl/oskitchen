/**
 * Audit Shopify-to-KDS landing page (Blueprint P3-62).
 *
 * Usage:
 *   npm run audit:shopify-to-kds-landing-p3-62
 */
import {
  auditShopifyToKdsLandingP3_62,
  formatShopifyToKdsLandingP3_62AuditLines,
} from "@/lib/marketing/shopify-to-kds-landing-p3-62-audit";

function main(): void {
  const summary = auditShopifyToKdsLandingP3_62();

  console.log("");
  for (const line of formatShopifyToKdsLandingP3_62AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Shopify-to-KDS landing P3-62 OK");
}

main();
