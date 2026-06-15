/**
 * Audit packing verification (Blueprint P2-94).
 *
 * Usage:
 *   npm run audit:packing-verification-p2-94
 */
import {
  auditPackingVerificationP2_94,
  formatPackingVerificationP2_94AuditLines,
} from "@/lib/kitchen/packing-verification-p2-94-audit";

function main(): void {
  const summary = auditPackingVerificationP2_94();

  console.log("");
  for (const line of formatPackingVerificationP2_94AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Packing verification (P2-94) audit OK");
}

main();
