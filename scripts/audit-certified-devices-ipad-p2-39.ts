/**
 * Audit certified iPad devices list (Blueprint P2-39).
 *
 * Usage:
 *   npm run audit:certified-devices-ipad-p2-39
 */
import {
  auditCertifiedDevicesIpadP2_39,
  formatCertifiedDevicesIpadP2_39AuditLines,
} from "@/lib/hardware/certified-devices-ipad-p2-39-audit";

function main(): void {
  const summary = auditCertifiedDevicesIpadP2_39();

  console.log("");
  for (const line of formatCertifiedDevicesIpadP2_39AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Certified iPad devices P2-39 OK");
}

main();
