/**
 * Audit table service depth (Blueprint P2-89).
 *
 * Usage:
 *   npm run audit:table-service-depth
 */
import {
  auditTableServiceDepth,
  formatTableServiceDepthAuditLines,
} from "@/lib/pos/table-service-depth-audit";

function main(): void {
  const summary = auditTableServiceDepth();

  console.log("");
  for (const line of formatTableServiceDepthAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Table service depth audit OK");
}

main();
