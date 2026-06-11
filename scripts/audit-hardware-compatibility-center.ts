/**
 * Audit hardware compatibility center (Blueprint P2-87).
 *
 * Usage:
 *   npm run audit:hardware-compatibility-center
 */
import {
  auditHardwareCompatibilityCenter,
  formatHardwareCompatibilityCenterAuditLines,
} from "@/lib/hardware/hardware-compatibility-center-audit";

function main(): void {
  const summary = auditHardwareCompatibilityCenter();

  console.log("");
  for (const line of formatHardwareCompatibilityCenterAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Hardware compatibility center audit OK");
}

main();
