/**
 * Audit VoiceOver / NVDA sweep on Today, POS, and KDS.
 *
 * Usage:
 *   npm run audit:a11y-voiceover-sweep
 */
import {
  auditA11yVoiceoverSweep,
  formatA11yVoiceoverSweepAuditLines,
} from "@/lib/design/a11y-voiceover-sweep-audit";

function main(): void {
  const summary = auditA11yVoiceoverSweep();

  console.log("");
  for (const line of formatA11yVoiceoverSweepAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ A11y VoiceOver sweep audit OK");
}

main();
