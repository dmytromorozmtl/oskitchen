/**
 * Audit hardware compatibility roadmap — Toast parity (Blueprint P2-37).
 *
 * Usage:
 *   npm run audit:hardware-compatibility-roadmap-p2-37
 */
import {
  auditHardwareCompatibilityRoadmapP2_37,
  formatHardwareCompatibilityRoadmapP2_37AuditLines,
} from "@/lib/hardware/hardware-compatibility-roadmap-p2-37-audit";

function main(): void {
  const summary = auditHardwareCompatibilityRoadmapP2_37();

  console.log("");
  for (const line of formatHardwareCompatibilityRoadmapP2_37AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Hardware compatibility roadmap P2-37 OK");
}

main();
