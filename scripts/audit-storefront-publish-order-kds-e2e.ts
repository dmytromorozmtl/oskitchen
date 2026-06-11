/**
 * Audit Storefront publish → order → KDS E2E wiring.
 *
 * Usage:
 *   npm run audit:storefront-publish-order-kds-e2e
 */
import {
  auditStorefrontPublishOrderKdsE2E,
  formatStorefrontPublishOrderKdsAuditLines,
} from "@/lib/qa/storefront-publish-order-kds-e2e-audit";

function main(): void {
  const summary = auditStorefrontPublishOrderKdsE2E();

  console.log("");
  for (const line of formatStorefrontPublishOrderKdsAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Storefront publish → order → KDS E2E audit OK");
}

main();
