/**
 * Audit certified hardware guide (Blueprint P2-86).
 *
 * Usage:
 *   npm run audit:certified-hardware-guide
 */
import {
  auditCertifiedHardwareGuide,
  formatCertifiedHardwareGuideAuditLines,
} from "@/lib/hardware/certified-hardware-guide-audit";

function main(): void {
  const summary = auditCertifiedHardwareGuide();

  console.log("");
  for (const line of formatCertifiedHardwareGuideAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Certified hardware guide audit OK");
}

main();
