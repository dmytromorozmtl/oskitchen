/**
 * Audit permission-denied state design (icon + message + Request access).
 *
 * Usage:
 *   npm run audit:permission-denied-state
 */
import {
  auditPermissionDeniedState,
  formatPermissionDeniedStateAuditLines,
} from "@/lib/design/permission-denied-state-audit";

function main(): void {
  const summary = auditPermissionDeniedState();

  console.log("");
  for (const line of formatPermissionDeniedStateAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Permission-denied state audit OK");
}

main();
