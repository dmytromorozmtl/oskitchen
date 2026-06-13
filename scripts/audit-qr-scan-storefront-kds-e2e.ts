/**
 * Audit P2-32 QR scan→storefront→KDS E2E wiring.
 *
 * Usage:
 *   npm run audit:qr-scan-storefront-kds-e2e
 */
import {
  auditQrScanStorefrontKdsE2E,
  formatQrScanStorefrontKdsE2EAuditLines,
} from "@/lib/qa/qr-scan-storefront-kds-e2e-audit";

function main(): void {
  const summary = auditQrScanStorefrontKdsE2E();

  console.log("");
  for (const line of formatQrScanStorefrontKdsE2EAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ QR scan→storefront→KDS E2E audit OK");
}

main();
