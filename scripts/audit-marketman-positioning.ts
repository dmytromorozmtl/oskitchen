/**
 * Audit MarketMan positioning (Blueprint P1-77).
 *
 * Usage:
 *   npm run audit:marketman-positioning
 */
import {
  auditMarketmanPositioning,
  formatMarketmanPositioningAuditLines,
} from "@/lib/marketing/marketman-positioning-audit";

function main(): void {
  const summary = auditMarketmanPositioning();

  console.log("");
  for (const line of formatMarketmanPositioningAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ MarketMan positioning audit OK");
}

main();
