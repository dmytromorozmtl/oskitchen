/**
 * Audit forbidden claims training (Blueprint P1-84).
 *
 * Usage:
 *   npm run audit:forbidden-claims-training
 */
import {
  auditForbiddenClaimsTraining,
  formatForbiddenClaimsTrainingAuditLines,
} from "@/lib/marketing/forbidden-claims-training-audit";

function main(): void {
  const summary = auditForbiddenClaimsTraining();

  console.log("");
  for (const line of formatForbiddenClaimsTrainingAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Forbidden claims training audit OK");
}

main();
