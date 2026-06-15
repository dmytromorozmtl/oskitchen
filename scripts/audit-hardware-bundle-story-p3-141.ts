/**
 * Audit hardware bundle story baseline (Blueprint P3-141).
 *
 * Usage:
 *   npm run audit:hardware-bundle-story-p3-141
 */
import {
  auditHardwareBundleStoryP3_141,
  formatHardwareBundleStoryP3_141AuditLines,
} from "@/lib/hardware/hardware-bundle-story-p3-141-audit";

function main(): void {
  const summary = auditHardwareBundleStoryP3_141();

  console.log("");
  for (const line of formatHardwareBundleStoryP3_141AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Hardware bundle story audit OK");
}

main();
