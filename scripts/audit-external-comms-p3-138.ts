/**
 * Audit external comms PM policy baseline (Blueprint P3-138).
 *
 * Usage:
 *   npm run audit:external-comms-p3-138
 */
import {
  auditExternalCommsP3_138,
  formatExternalCommsP3_138AuditLines,
} from "@/lib/pm/external-comms-p3-138-audit";

function main(): void {
  const summary = auditExternalCommsP3_138();

  console.log("");
  for (const line of formatExternalCommsP3_138AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ External comms PM audit OK");
}

main();
