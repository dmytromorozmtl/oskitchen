/**
 * Audit AI action drafts (Blueprint P2-106).
 *
 * Usage:
 *   npm run audit:ai-action-drafts-p2-106
 */
import {
  auditAiActionDraftsP2_106,
  formatAiActionDraftsP2_106AuditLines,
} from "@/lib/ai/ai-action-drafts-p2-106-audit";

function main(): void {
  const summary = auditAiActionDraftsP2_106();

  console.log("");
  for (const line of formatAiActionDraftsP2_106AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ AI action drafts (P2-106) audit OK");
}

main();
