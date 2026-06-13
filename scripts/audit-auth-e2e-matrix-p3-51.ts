/**
 * Audit auth E2E matrix (Blueprint P3-51).
 *
 * Usage:
 *   npm run audit:auth-e2e-matrix-p3-51
 */
import {
  auditAuthE2eMatrixP3_51,
  formatAuthE2eMatrixP3_51AuditLines,
} from "@/lib/qa/auth-e2e-matrix-p3-51-audit";

function main(): void {
  const summary = auditAuthE2eMatrixP3_51();

  console.log("");
  for (const line of formatAuthE2eMatrixP3_51AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Auth E2E matrix P3-51 OK");
}

main();
