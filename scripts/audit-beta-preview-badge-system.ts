/**
 * Audit BETA / COMING SOON / NEW badge system.
 *
 * Usage:
 *   npm run audit:beta-preview-badge-system
 */
import {
  auditBetaPreviewBadgeSystem,
  formatBetaPreviewBadgeSystemAuditLines,
} from "@/lib/design/beta-preview-badge-system-audit";

function main(): void {
  const summary = auditBetaPreviewBadgeSystem();

  console.log("");
  for (const line of formatBetaPreviewBadgeSystemAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ BETA/preview badge system audit OK");
}

main();
