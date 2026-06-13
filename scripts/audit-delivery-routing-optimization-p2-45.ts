/**
 * Audit delivery routing optimization (Blueprint P2-45).
 *
 * Usage:
 *   npm run audit:delivery-routing-optimization-p2-45
 */
import {
  auditDeliveryRoutingOptimizationP2_45,
  formatDeliveryRoutingOptimizationP2_45AuditLines,
} from "@/lib/delivery/delivery-routing-optimization-p2-45-audit";

function main(): void {
  const summary = auditDeliveryRoutingOptimizationP2_45();

  console.log("");
  for (const line of formatDeliveryRoutingOptimizationP2_45AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Delivery routing optimization P2-45 OK");
}

main();
