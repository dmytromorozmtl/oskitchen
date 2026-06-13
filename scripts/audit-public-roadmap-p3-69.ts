/**
 * Audit public roadmap page (Blueprint P3-69).
 *
 * Usage:
 *   npm run audit:public-roadmap-p3-69
 */
import {
  auditPublicRoadmapP3_69,
  formatPublicRoadmapP3_69AuditLines,
} from "@/lib/marketing/public-roadmap-p3-69-audit";

function main(): void {
  const summary = auditPublicRoadmapP3_69();

  console.log("");
  for (const line of formatPublicRoadmapP3_69AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Public roadmap P3-69 OK");
}

main();
