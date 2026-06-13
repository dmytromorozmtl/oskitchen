/**
 * Audit P2-31 loyalty earn/redeem E2E wiring.
 *
 * Usage:
 *   npm run audit:loyalty-earn-redeem-e2e
 */
import {
  auditLoyaltyEarnRedeemE2E,
  formatLoyaltyEarnRedeemE2EAuditLines,
} from "@/lib/loyalty/loyalty-earn-redeem-e2e-audit";

function main(): void {
  const summary = auditLoyaltyEarnRedeemE2E();

  console.log("");
  for (const line of formatLoyaltyEarnRedeemE2EAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Loyalty earn/redeem E2E audit OK");
}

main();
