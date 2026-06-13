/**
 * Audit predictive daily briefing — Toast IQ parity (Blueprint P2-38).
 *
 * Usage:
 *   npm run audit:predictive-daily-briefing-p2-38
 */
import {
  auditPredictiveDailyBriefingP2_38,
  formatPredictiveDailyBriefingP2_38AuditLines,
} from "@/lib/ai/predictive-daily-briefing-p2-38-audit";

function main(): void {
  const summary = auditPredictiveDailyBriefingP2_38();

  console.log("");
  for (const line of formatPredictiveDailyBriefingP2_38AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Predictive daily briefing P2-38 OK");
}

main();
