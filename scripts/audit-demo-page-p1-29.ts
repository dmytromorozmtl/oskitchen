/**
 * Audit P1-29 demo page — interactive sandbox workspace with Integration Health.
 *
 * Usage:
 *   npm run audit:demo-page
 */
import {
  auditDemoPageP129,
  formatDemoPageP129AuditLines,
} from "@/lib/marketing/demo-page-p1-29-audit";

function main(): void {
  const summary = auditDemoPageP129();

  console.log("");
  for (const line of formatDemoPageP129AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Demo page P1-29 audit OK");
}

main();
