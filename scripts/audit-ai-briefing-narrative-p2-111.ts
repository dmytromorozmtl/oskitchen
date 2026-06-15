/**
 * Audit AI briefing narrative (Blueprint P2-111).
 *
 * Usage:
 *   npm run audit:ai-briefing-narrative-p2-111
 */
import {
  auditAiBriefingNarrativeP2_111,
  formatAiBriefingNarrativeP2_111AuditLines,
} from "@/lib/ai/ai-briefing-narrative-p2-111-audit";

function main(): void {
  const summary = auditAiBriefingNarrativeP2_111();

  console.log("");
  for (const line of formatAiBriefingNarrativeP2_111AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ AI briefing narrative (P2-111) audit OK");
}

main();
