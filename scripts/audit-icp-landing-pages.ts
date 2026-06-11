/**
 * Audit ICP landing pages (Blueprint P1-79).
 *
 * Usage:
 *   npm run audit:icp-landing-pages
 */
import {
  auditIcpLandingPages,
  formatIcpLandingPagesAuditLines,
} from "@/lib/marketing/icp-landing-pages-audit";

function main(): void {
  const summary = auditIcpLandingPages();

  console.log("");
  for (const line of formatIcpLandingPagesAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ ICP landing pages audit OK");
}

main();
