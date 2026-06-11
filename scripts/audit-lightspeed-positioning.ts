/**
 * Audit Lightspeed positioning (Blueprint P1-76).
 *
 * Usage:
 *   npm run audit:lightspeed-positioning
 */
import {
  auditLightspeedPositioning,
  formatLightspeedPositioningAuditLines,
} from "@/lib/marketing/lightspeed-positioning-audit";

function main(): void {
  const summary = auditLightspeedPositioning();

  console.log("");
  for (const line of formatLightspeedPositioningAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Lightspeed positioning audit OK");
}

main();
