/**
 * Audit Owner Daily Briefing briefing-first narrative strip.
 *
 * Usage:
 *   npm run audit:briefing-first-design
 */
import {
  auditBriefingFirstDesign,
  formatBriefingFirstDesignAuditLines,
} from "@/lib/design/briefing-first-design-audit";

function main(): void {
  const summary = auditBriefingFirstDesign();

  console.log("");
  for (const line of formatBriefingFirstDesignAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Briefing-first design audit OK");
}

main();
