/**
 * Audit design partner outreach list (Blueprint P1-25).
 *
 * Usage:
 *   npm run audit:design-partner-outreach
 */
import {
  auditDesignPartnerOutreach,
  formatDesignPartnerOutreachAuditLines,
} from "@/lib/marketing/design-partner-outreach-audit";

function main(): void {
  const summary = auditDesignPartnerOutreach();

  console.log("");
  for (const line of formatDesignPartnerOutreachAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Design partner outreach audit OK");
}

main();
