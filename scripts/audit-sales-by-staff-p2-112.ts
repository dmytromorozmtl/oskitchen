/**
 * Audit sales-by-staff analytics (Blueprint P2-112).
 *
 * Usage:
 *   npm run audit:sales-by-staff-p2-112
 */
import {
  auditSalesByStaffP2_112,
  formatSalesByStaffP2_112AuditLines,
} from "@/lib/analytics/sales-by-staff-p2-112-audit";

function main(): void {
  const summary = auditSalesByStaffP2_112();

  console.log("");
  for (const line of formatSalesByStaffP2_112AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Sales-by-staff (P2-112) audit OK");
}

main();
