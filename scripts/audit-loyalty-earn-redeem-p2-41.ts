/**
 * Audit loyalty earn/redeem storefront flow (Blueprint P2-41).
 *
 * Usage:
 *   npm run audit:loyalty-earn-redeem-p2-41
 */
import {
  auditLoyaltyEarnRedeemP2_41,
  formatLoyaltyEarnRedeemP2_41AuditLines,
} from "@/lib/loyalty/loyalty-earn-redeem-p2-41-audit";

function main(): void {
  const summary = auditLoyaltyEarnRedeemP2_41();

  console.log("");
  for (const line of formatLoyaltyEarnRedeemP2_41AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Loyalty earn/redeem P2-41 OK");
}

main();
