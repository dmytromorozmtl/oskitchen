/**
 * Audit competitor battle cards (Blueprint P1-85).
 *
 * Usage:
 *   npm run audit:competitor-battle-cards-p1-85
 */
import {
  auditCompetitorBattleCardsP1_85,
  formatCompetitorBattleCardsP1_85AuditLines,
} from "@/lib/marketing/competitor-battle-cards-p1-85-audit";

function main(): void {
  const summary = auditCompetitorBattleCardsP1_85();

  console.log("");
  for (const line of formatCompetitorBattleCardsP1_85AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Competitor battle cards audit OK");
}

main();
