/**
 * Audit POS checkout E2E full scenario wiring.
 *
 * Usage:
 *   npm run audit:pos-checkout-e2e
 */
import {
  auditPosCheckoutE2E,
  formatPosCheckoutE2EAuditLines,
} from "@/lib/pos/pos-checkout-e2e-audit";

function main(): void {
  const summary = auditPosCheckoutE2E();

  console.log("");
  for (const line of formatPosCheckoutE2EAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ POS checkout E2E audit OK");
}

main();
