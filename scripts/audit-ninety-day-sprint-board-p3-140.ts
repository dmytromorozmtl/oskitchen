/**
 * Audit 90-day sprint board PM baseline (Blueprint P3-140).
 *
 * Usage:
 *   npm run audit:ninety-day-sprint-board-p3-140
 */
import {
  auditNinetyDaySprintBoardP3_140,
  formatNinetyDaySprintBoardP3_140AuditLines,
} from "@/lib/pm/ninety-day-sprint-board-p3-140-audit";

function main(): void {
  const summary = auditNinetyDaySprintBoardP3_140();

  console.log("");
  for (const line of formatNinetyDaySprintBoardP3_140AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ 90-day sprint board PM audit OK");
}

main();
