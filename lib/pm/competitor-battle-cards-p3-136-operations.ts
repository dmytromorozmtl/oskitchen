import { readFileSync } from "node:fs";
import { join } from "node:path";

import { COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES } from "@/lib/marketing/competitor-battle-cards-p1-85-content";
import { competitorBattleCardDocPath } from "@/lib/marketing/competitor-battle-cards-p1-85-policy";
import {
  COMPETITOR_BATTLE_CARDS_P3_136_CARD_COUNT,
  COMPETITOR_BATTLE_CARDS_P3_136_FRAMEWORK,
  COMPETITOR_BATTLE_CARDS_P3_136_IMPLEMENTATION_REF,
  COMPETITOR_BATTLE_CARDS_P3_136_POLICY_ID,
} from "@/lib/pm/competitor-battle-cards-p3-136-policy";

export type CompetitorBattleCardPmRecord = {
  cardId: string;
  slug: string;
  displayName: string;
  docPath: string;
  status: string;
};

export type CompetitorBattleCardsPmRegistry = {
  version: string;
  policyId: typeof COMPETITOR_BATTLE_CARDS_P3_136_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  implementationRef: string;
  framework: string;
  cardCount: number;
  cards: CompetitorBattleCardPmRecord[];
};

export function loadCompetitorBattleCardsPmRegistry(
  root = process.cwd(),
  artifactPath = "artifacts/competitor-battle-cards-pm-registry.json",
): CompetitorBattleCardsPmRegistry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as CompetitorBattleCardsPmRegistry;
}

export function validateCompetitorBattleCardsPmRegistry(
  registry: CompetitorBattleCardsPmRegistry,
): {
  valid: boolean;
  policyIdMatches: boolean;
  cardCountMatches: boolean;
  cardsMatchContent: boolean;
  allPublished: boolean;
} {
  const policyIdMatches = registry.policyId === COMPETITOR_BATTLE_CARDS_P3_136_POLICY_ID;

  const cardCountMatches =
    registry.cardCount === COMPETITOR_BATTLE_CARDS_P3_136_CARD_COUNT &&
    registry.cards.length === COMPETITOR_BATTLE_CARDS_P3_136_CARD_COUNT;

  const cardsMatchContent =
    COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES.length === COMPETITOR_BATTLE_CARDS_P3_136_CARD_COUNT &&
    COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES.every((entry, index) => {
      const card = registry.cards[index];
      return (
        card?.slug === entry.slug &&
        card?.cardId === entry.cardId &&
        card?.displayName === entry.displayName &&
        card?.docPath === competitorBattleCardDocPath(entry.slug)
      );
    });

  const allPublished = registry.cards.every((card) => card.status === "published");

  const valid =
    policyIdMatches &&
    cardCountMatches &&
    cardsMatchContent &&
    allPublished &&
    registry.implementationRef === COMPETITOR_BATTLE_CARDS_P3_136_IMPLEMENTATION_REF &&
    registry.framework === COMPETITOR_BATTLE_CARDS_P3_136_FRAMEWORK;

  return {
    valid,
    policyIdMatches,
    cardCountMatches,
    cardsMatchContent,
    allPublished,
  };
}
