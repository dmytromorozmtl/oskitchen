/**
 * Audit AI no hallucination mode (Blueprint P2-110).
 *
 * Usage:
 *   npm run audit:ai-no-hallucination-mode-p2-110
 */
import {
  auditAiNoHallucinationModeP2_110,
  formatAiNoHallucinationModeP2_110AuditLines,
} from "@/lib/ai/ai-no-hallucination-mode-p2-110-audit";

function main(): void {
  const summary = auditAiNoHallucinationModeP2_110();

  console.log("");
  for (const line of formatAiNoHallucinationModeP2_110AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ AI no hallucination mode (P2-110) audit OK");
}

main();
