/**
 * Audit POS offline mode v1.0 (Blueprint P2-88).
 *
 * Usage:
 *   npm run audit:pos-offline-mode-v1
 */
import {
  auditPosOfflineModeV1,
  formatPosOfflineModeV1AuditLines,
} from "@/lib/pos/pos-offline-mode-v1-audit";

function main(): void {
  const summary = auditPosOfflineModeV1();

  console.log("");
  for (const line of formatPosOfflineModeV1AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ POS offline mode v1 audit OK");
}

main();
