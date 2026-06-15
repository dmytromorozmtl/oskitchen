/**
 * Audit expo mode (Blueprint P2-93).
 *
 * Usage:
 *   npm run audit:expo-mode
 */
import { auditExpoMode, formatExpoModeAuditLines } from "@/lib/kitchen/expo-mode-p2-93-audit";

function main(): void {
  const summary = auditExpoMode();

  console.log("");
  for (const line of formatExpoModeAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Expo mode audit OK");
}

main();
