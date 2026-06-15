/**
 * Audit competitor battle cards PM baseline (Blueprint P3-136).
 *
 * Usage:
 *   npm run audit:competitor-battle-cards-p3-136
 */
import {
  auditCompetitorBattleCardsP3_136,
  formatCompetitorBattleCardsP3_136AuditLines,
} from "@/lib/pm/competitor-battle-cards-p3-136-audit";

function main(): void {
  const summary = auditCompetitorBattleCardsP3_136();

  console.log("");
  for (const line of formatCompetitorBattleCardsP3_136AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Competitor battle cards PM audit OK");
}

main();
