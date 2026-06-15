/**
 * Audit route optimization engine (Blueprint P2-114).
 *
 * Usage:
 *   npm run audit:route-optimization-p2-114
 */
import {
  auditRouteOptimizationP2_114,
  formatRouteOptimizationP2_114AuditLines,
} from "@/lib/delivery/route-optimization-p2-114-audit";

function main(): void {
  const summary = auditRouteOptimizationP2_114();

  console.log("");
  for (const line of formatRouteOptimizationP2_114AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Route optimization (P2-114) audit OK");
}

main();
