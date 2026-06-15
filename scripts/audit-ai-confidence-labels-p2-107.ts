/**
 * Audit AI confidence labels (Blueprint P2-107).
 *
 * Usage:
 *   npm run audit:ai-confidence-labels-p2-107
 */
import {
  auditAiConfidenceLabelsP2_107,
  formatAiConfidenceLabelsP2_107AuditLines,
} from "@/lib/ai/ai-confidence-labels-p2-107-audit";

function main(): void {
  const summary = auditAiConfidenceLabelsP2_107();

  console.log("");
  for (const line of formatAiConfidenceLabelsP2_107AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ AI confidence labels (P2-107) audit OK");
}

main();
