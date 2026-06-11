/**
 * Materialize 21 one-page competitor battle cards (Blueprint P1-85).
 *
 * Usage:
 *   tsx scripts/materialize-competitor-battle-cards-p1-85.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES } from "@/lib/marketing/competitor-battle-cards-p1-85-content";
import { renderCompetitorBattleCardMarkdown } from "@/lib/marketing/competitor-battle-cards-p1-85-markdown";
import {
  COMPETITOR_BATTLE_CARDS_P1_85_DIR,
  competitorBattleCardDocPath,
} from "@/lib/marketing/competitor-battle-cards-p1-85-policy";

function main(): void {
  const root = process.cwd();
  mkdirSync(join(root, COMPETITOR_BATTLE_CARDS_P1_85_DIR), { recursive: true });

  for (const entry of COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES) {
    const rel = competitorBattleCardDocPath(entry.slug);
    writeFileSync(join(root, rel), `${renderCompetitorBattleCardMarkdown(entry)}\n`, "utf8");
  }

  console.log(`✓ Materialized ${COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES.length} battle cards`);
}

main();
