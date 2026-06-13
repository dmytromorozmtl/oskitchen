/**
 * Audit hardware compatibility center (Blueprint P3-80).
 *
 * Usage:
 *   npm run audit:hardware-compatibility-center-p3-80
 */
import {
  auditHardwareCompatibilityCenter,
  formatHardwareCompatibilityCenterAuditLines,
} from "@/lib/hardware/hardware-compatibility-center-audit";
import {
  auditHardwareCompatibilityCenterP3_80,
  formatHardwareCompatibilityCenterP3_80AuditLines,
} from "@/lib/hardware/hardware-compatibility-center-p3-80-audit";

function main(): void {
  const upstream = auditHardwareCompatibilityCenter();

  console.log("");
  for (const line of formatHardwareCompatibilityCenterAuditLines(upstream)) {
    console.log(line);
  }
  console.log("");

  const summary = auditHardwareCompatibilityCenterP3_80();

  for (const line of formatHardwareCompatibilityCenterP3_80AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Hardware compatibility center P3-80 OK");
}

main();
