/**
 * Audit hardware compatibility roadmap baseline (Blueprint P3-146).
 *
 * Usage:
 *   npm run audit:hardware-compatibility-roadmap-p3-146
 */
import {
  auditHardwareCompatibilityRoadmapP3_146,
  formatHardwareCompatibilityRoadmapP3_146AuditLines,
} from "@/lib/hardware/hardware-compatibility-roadmap-p3-146-audit";

function main(): void {
  const summary = auditHardwareCompatibilityRoadmapP3_146();

  console.log("");
  for (const line of formatHardwareCompatibilityRoadmapP3_146AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Hardware compatibility roadmap audit OK");
}

main();
