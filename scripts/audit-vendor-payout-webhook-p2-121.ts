/**
 * Audit vendor payout webhook (Blueprint P2-121).
 *
 * Usage:
 *   npm run audit:vendor-payout-webhook-p2-121
 */
import {
  auditVendorPayoutWebhookP2_121,
  formatVendorPayoutWebhookP2_121AuditLines,
} from "@/lib/marketplace/vendor-payout-webhook-p2-121-audit";

function main(): void {
  const summary = auditVendorPayoutWebhookP2_121();

  console.log("");
  for (const line of formatVendorPayoutWebhookP2_121AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Vendor payout webhook (P2-121) audit OK");
}

main();
