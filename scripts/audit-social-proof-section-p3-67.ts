/**
 * Audit social proof section (Blueprint P3-67).
 *
 * Usage:
 *   npm run audit:social-proof-section-p3-67
 */
import {
  auditSocialProofSectionP3_67,
  formatSocialProofSectionP3_67AuditLines,
} from "@/lib/marketing/social-proof-section-p3-67-audit";

function main(): void {
  const summary = auditSocialProofSectionP3_67();

  console.log("");
  for (const line of formatSocialProofSectionP3_67AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Social proof section P3-67 OK");
}

main();
