/**
 * Audit cashier shift flow (Blueprint P2-42).
 *
 * Usage:
 *   npm run audit:cashier-shift-flow-p2-42
 */
import {
  auditCashierShiftFlowP2_42,
  formatCashierShiftFlowP2_42AuditLines,
} from "@/lib/pos/cashier-shift-flow-p2-42-audit";

function main(): void {
  const summary = auditCashierShiftFlowP2_42();

  console.log("");
  for (const line of formatCashierShiftFlowP2_42AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Cashier shift flow P2-42 OK");
}

main();
