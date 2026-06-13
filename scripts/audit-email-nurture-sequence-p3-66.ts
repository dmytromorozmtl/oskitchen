/**
 * Audit email nurture sequence (Blueprint P3-66).
 *
 * Usage:
 *   npm run audit:email-nurture-sequence-p3-66
 */
import {
  auditEmailNurtureSequenceP3_66,
  formatEmailNurtureSequenceP3_66AuditLines,
} from "@/lib/marketing/email-nurture-sequence-p3-66-audit";

function main(): void {
  const summary = auditEmailNurtureSequenceP3_66();

  console.log("");
  for (const line of formatEmailNurtureSequenceP3_66AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Email nurture sequence P3-66 OK");
}

main();
