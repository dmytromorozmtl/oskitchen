/**
 * Audit role permissions matrix E2E wiring.
 *
 * Usage:
 *   npm run audit:role-permissions-matrix-e2e
 */
import {
  auditRolePermissionsMatrixE2E,
  formatRolePermissionsMatrixAuditLines,
} from "@/lib/qa/role-permissions-matrix-e2e-audit";

function main(): void {
  const summary = auditRolePermissionsMatrixE2E();

  console.log("");
  for (const line of formatRolePermissionsMatrixAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Role permissions matrix E2E audit OK");
}

main();
