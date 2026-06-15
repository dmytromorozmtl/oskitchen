import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditCompetitorBattleCardsP1_85 } from "@/lib/marketing/competitor-battle-cards-p1-85-audit";
import { COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES } from "@/lib/marketing/competitor-battle-cards-p1-85-content";
import {
  loadCompetitorBattleCardsPmRegistry,
  validateCompetitorBattleCardsPmRegistry,
} from "@/lib/pm/competitor-battle-cards-p3-136-operations";
import {
  COMPETITOR_BATTLE_CARDS_P3_136_ARTIFACT,
  COMPETITOR_BATTLE_CARDS_P3_136_CARD_COUNT,
  COMPETITOR_BATTLE_CARDS_P3_136_DOC,
  COMPETITOR_BATTLE_CARDS_P3_136_FRAMEWORK,
  COMPETITOR_BATTLE_CARDS_P3_136_HONESTY_MARKERS,
  COMPETITOR_BATTLE_CARDS_P3_136_IMPLEMENTATION_REF,
  COMPETITOR_BATTLE_CARDS_P3_136_POLICY_ID,
  COMPETITOR_BATTLE_CARDS_P3_136_RELATED_DOCS,
  COMPETITOR_BATTLE_CARDS_P3_136_REQUIRED_SECTIONS,
  COMPETITOR_BATTLE_CARDS_P3_136_WIRING_PATHS,
} from "@/lib/pm/competitor-battle-cards-p3-136-policy";

export type CompetitorBattleCardsP3_136AuditSummary = {
  policyId: typeof COMPETITOR_BATTLE_CARDS_P3_136_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  liveP1_85AuditPassed: boolean;
  relatedDocsReferenced: boolean;
  cardsDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditCompetitorBattleCardsP3_136(
  root = process.cwd(),
): CompetitorBattleCardsP3_136AuditSummary {
  const wiringComplete = COMPETITOR_BATTLE_CARDS_P3_136_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let cardsDocumented = false;

  if (existsSync(join(root, COMPETITOR_BATTLE_CARDS_P3_136_DOC))) {
    const source = readFileSync(join(root, COMPETITOR_BATTLE_CARDS_P3_136_DOC), "utf8");
    docWired =
      source.includes(String(COMPETITOR_BATTLE_CARDS_P3_136_CARD_COUNT)) &&
      source.includes(COMPETITOR_BATTLE_CARDS_P3_136_FRAMEWORK) &&
      source.includes(COMPETITOR_BATTLE_CARDS_P3_136_IMPLEMENTATION_REF) &&
      COMPETITOR_BATTLE_CARDS_P3_136_REQUIRED_SECTIONS.every((section) =>
        source.includes(section),
      );
    relatedDocsReferenced = COMPETITOR_BATTLE_CARDS_P3_136_RELATED_DOCS.every((doc) => {
      const basename = doc.split("/").pop() ?? doc;
      return source.includes(basename);
    });
    cardsDocumented = COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES.every(
      (entry) => source.includes(entry.slug) && source.includes(entry.cardId),
    );
  }

  let registryValid = false;
  if (existsSync(join(root, COMPETITOR_BATTLE_CARDS_P3_136_ARTIFACT))) {
    const registry = loadCompetitorBattleCardsPmRegistry(root);
    registryValid = validateCompetitorBattleCardsPmRegistry(registry).valid;
  }

  const liveP1_85AuditPassed = auditCompetitorBattleCardsP1_85(root).passed;

  const combinedSources = [COMPETITOR_BATTLE_CARDS_P3_136_DOC, COMPETITOR_BATTLE_CARDS_P3_136_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = COMPETITOR_BATTLE_CARDS_P3_136_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    liveP1_85AuditPassed &&
    relatedDocsReferenced &&
    cardsDocumented &&
    honestyMarkersPresent;

  return {
    policyId: COMPETITOR_BATTLE_CARDS_P3_136_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    liveP1_85AuditPassed,
    relatedDocsReferenced,
    cardsDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatCompetitorBattleCardsP3_136AuditLines(
  summary: CompetitorBattleCardsP3_136AuditSummary,
): string[] {
  return [
    `Competitor battle cards PM audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${COMPETITOR_BATTLE_CARDS_P3_136_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `Live P1-85 audit: ${summary.liveP1_85AuditPassed ? "PASS" : "FAIL"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `21 cards documented: ${summary.cardsDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
