/**
 * Audit restaurant purchasing marketplace (Blueprint P2-117).
 *
 * Usage:
 *   npm run audit:restaurant-purchasing-p2-117
 */
import {
  auditRestaurantPurchasingP2_117,
  formatRestaurantPurchasingP2_117AuditLines,
} from "@/lib/marketplace/restaurant-purchasing-p2-117-audit";

function main(): void {
  const summary = auditRestaurantPurchasingP2_117();

  console.log("");
  for (const line of formatRestaurantPurchasingP2_117AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Restaurant purchasing (P2-117) audit OK");
}

main();
