/**
 * Audit feature graduation criteria (Blueprint P3-132).
 *
 * Usage:
 *   npm run audit:feature-graduation-p3-132
 */
import {
  auditFeatureGraduation,
  formatFeatureGraduationAuditLines,
} from "@/lib/pm/feature-graduation-p3-132-audit";

function main(): void {
  const summary = auditFeatureGraduation();

  console.log("");
  for (const line of formatFeatureGraduationAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Feature graduation audit OK");
}

main();
