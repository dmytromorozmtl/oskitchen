/**
 * Audit menu engineering (Blueprint P2-105).
 *
 * Usage:
 *   npm run audit:menu-engineering-p2-105
 */
import {
  auditMenuEngineeringP2_105,
  formatMenuEngineeringP2_105AuditLines,
} from "@/lib/analytics/menu-engineering-p2-105-audit";

function main(): void {
  const summary = auditMenuEngineeringP2_105();

  console.log("");
  for (const line of formatMenuEngineeringP2_105AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Menu engineering (P2-105) audit OK");
}

main();
