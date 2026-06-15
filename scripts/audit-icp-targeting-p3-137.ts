/**
 * Audit ICP targeting PM baseline (Blueprint P3-137).
 *
 * Usage:
 *   npm run audit:icp-targeting-p3-137
 */
import {
  auditIcpTargetingP3_137,
  formatIcpTargetingP3_137AuditLines,
} from "@/lib/pm/icp-targeting-p3-137-audit";

function main(): void {
  const summary = auditIcpTargetingP3_137();

  console.log("");
  for (const line of formatIcpTargetingP3_137AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ ICP targeting PM audit OK");
}

main();
