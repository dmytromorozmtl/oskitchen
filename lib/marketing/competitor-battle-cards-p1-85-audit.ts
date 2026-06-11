import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES } from "@/lib/marketing/competitor-battle-cards-p1-85-content";
import {
  COMPETITOR_BATTLE_CARDS_P1_85_COUNT,
  COMPETITOR_BATTLE_CARDS_P1_85_FRAMEWORK,
  COMPETITOR_BATTLE_CARDS_P1_85_HONESTY_MARKERS,
  COMPETITOR_BATTLE_CARDS_P1_85_INDEX_DOC,
  COMPETITOR_BATTLE_CARDS_P1_85_PARENT_DOC,
  COMPETITOR_BATTLE_CARDS_P1_85_POLICY_ID,
  COMPETITOR_BATTLE_CARDS_P1_85_REQUIRED_SECTIONS,
  COMPETITOR_BATTLE_CARDS_P1_85_WIRING_PATHS,
  competitorBattleCardDocPath,
} from "@/lib/marketing/competitor-battle-cards-p1-85-policy";

export type CompetitorBattleCardsP1_85AuditSummary = {
  policyId: typeof COMPETITOR_BATTLE_CARDS_P1_85_POLICY_ID;
  wiringComplete: boolean;
  indexWired: boolean;
  parentDocWired: boolean;
  allPagesPresent: boolean;
  allPagesStructured: boolean;
  entryCountCorrect: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditCompetitorBattleCardsP1_85(
  root = process.cwd(),
): CompetitorBattleCardsP1_85AuditSummary {
  const wiringComplete = COMPETITOR_BATTLE_CARDS_P1_85_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let indexWired = false;
  let parentDocWired = false;

  if (existsSync(join(root, COMPETITOR_BATTLE_CARDS_P1_85_INDEX_DOC))) {
    const source = readFileSync(join(root, COMPETITOR_BATTLE_CARDS_P1_85_INDEX_DOC), "utf8");
    indexWired =
      source.includes(COMPETITOR_BATTLE_CARDS_P1_85_FRAMEWORK) &&
      source.includes(String(COMPETITOR_BATTLE_CARDS_P1_85_COUNT)) &&
      COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES.every((entry) =>
        source.includes(competitorBattleCardDocPath(entry.slug)),
      );
  }

  if (existsSync(join(root, COMPETITOR_BATTLE_CARDS_P1_85_PARENT_DOC))) {
    const source = readFileSync(join(root, COMPETITOR_BATTLE_CARDS_P1_85_PARENT_DOC), "utf8");
    parentDocWired =
      source.includes(COMPETITOR_BATTLE_CARDS_P1_85_INDEX_DOC) &&
      source.includes("21 one-page battle cards");
  }

  const allPagesPresent = COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES.every((entry) =>
    existsSync(join(root, competitorBattleCardDocPath(entry.slug))),
  );

  const allPagesStructured = COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES.every((entry) => {
    const path = join(root, competitorBattleCardDocPath(entry.slug));
    if (!existsSync(path)) return false;
    const source = readFileSync(path, "utf8");
    return (
      source.includes(`**slug:** \`${entry.slug}\``) &&
      source.includes(entry.displayName) &&
      COMPETITOR_BATTLE_CARDS_P1_85_REQUIRED_SECTIONS.every((section) =>
        source.includes(`## ${section}`),
      )
    );
  });

  const entryCountCorrect =
    COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES.length === COMPETITOR_BATTLE_CARDS_P1_85_COUNT;

  const combinedSources = [
    COMPETITOR_BATTLE_CARDS_P1_85_INDEX_DOC,
    "lib/marketing/competitor-battle-cards-p1-85-content.ts",
    ...COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES.map((entry) =>
      competitorBattleCardDocPath(entry.slug),
    ),
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = COMPETITOR_BATTLE_CARDS_P1_85_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    indexWired &&
    parentDocWired &&
    allPagesPresent &&
    allPagesStructured &&
    entryCountCorrect &&
    honestyMarkersPresent;

  return {
    policyId: COMPETITOR_BATTLE_CARDS_P1_85_POLICY_ID,
    wiringComplete,
    indexWired,
    parentDocWired,
    allPagesPresent,
    allPagesStructured,
    entryCountCorrect,
    honestyMarkersPresent,
    passed,
  };
}

export function formatCompetitorBattleCardsP1_85AuditLines(
  summary: CompetitorBattleCardsP1_85AuditSummary,
): string[] {
  return [
    `Competitor battle cards audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Index (${COMPETITOR_BATTLE_CARDS_P1_85_INDEX_DOC}): ${summary.indexWired ? "yes" : "no"}`,
    `Parent doc wired: ${summary.parentDocWired ? "yes" : "no"}`,
    `All pages present: ${summary.allPagesPresent ? "yes" : "no"}`,
    `All pages structured: ${summary.allPagesStructured ? "yes" : "no"}`,
    `Entry count (${COMPETITOR_BATTLE_CARDS_P1_85_COUNT}): ${summary.entryCountCorrect ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
