/**
 * Audit POS shift → checkout → receipt E2E wiring.
 *
 * Usage:
 *   npm run audit:pos-shift-checkout-receipt-e2e
 */
import {
  auditPosShiftCheckoutReceiptE2E,
  formatPosShiftCheckoutReceiptAuditLines,
} from "@/lib/pos/pos-shift-checkout-receipt-e2e-audit";

function main(): void {
  const summary = auditPosShiftCheckoutReceiptE2E();

  console.log("");
  for (const line of formatPosShiftCheckoutReceiptAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ POS shift → checkout → receipt E2E audit OK");
}

main();
