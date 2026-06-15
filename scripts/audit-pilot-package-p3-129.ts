/**
 * Audit pilot package v1 (Blueprint P3-129).
 *
 * Usage:
 *   npm run audit:pilot-package-p3-129
 */
import {
  auditPilotPackage,
  formatPilotPackageAuditLines,
} from "@/lib/pm/pilot-package-p3-129-audit";

function main(): void {
  const summary = auditPilotPackage();

  console.log("");
  for (const line of formatPilotPackageAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Pilot package v1 audit OK");
}

main();
