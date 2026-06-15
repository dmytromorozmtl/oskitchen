import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Absolute Final Task 32 — eight competitor battle cards (Toast → Olo).
 *
 * @see docs/competitive-battle-cards.md
 * @see lib/marketing/competitive-battle-cards-policy.ts
 * @see artifacts/competitor-feature-tracker.json → salesSafeCompetitorClaims
 */

export const COMPETITOR_BATTLE_CARDS_EIGHT_POLICY_ID =
  "competitor-battle-cards-eight-absolute-final-v1" as const;

export const COMPETITOR_BATTLE_CARDS_EIGHT_DOC = "docs/competitive-battle-cards.md" as const;

export const COMPETITOR_BATTLE_CARDS_EIGHT_TOTAL = 8 as const;

export const COMPETITOR_BATTLE_CARDS_EIGHT_SLUGS = [
  "toast",
  "square",
  "lightspeed",
  "clover",
  "revel",
  "touchbistro",
  "spoton",
  "olo",
] as const;

export type CompetitorBattleCardEightSlug =
  (typeof COMPETITOR_BATTLE_CARDS_EIGHT_SLUGS)[number];

const COMPETITOR_BATTLE_CARD_EIGHT_LABELS: Record<
  CompetitorBattleCardEightSlug,
  string
> = {
  toast: "Toast",
  square: "Square",
  lightspeed: "Lightspeed",
  clover: "Clover",
  revel: "Revel",
  touchbistro: "TouchBistro",
  spoton: "SpotOn",
  olo: "Olo",
};

function battleCardEightLabel(slug: CompetitorBattleCardEightSlug): string {
  return COMPETITOR_BATTLE_CARD_EIGHT_LABELS[slug];
}

export const COMPETITOR_BATTLE_CARDS_EIGHT_IDS = [
  "BC1",
  "BC2",
  "BC3",
  "BC4",
  "BC5",
  "BC6",
  "BC7",
  "BC8",
] as const;

export const COMPETITOR_BATTLE_CARDS_EIGHT_DOC_HEADINGS = [
  "Eight battle cards",
  "Battle card framework (WIN-TRAP-REDIRECT)",
  "Quick reference matrix",
  "Forbidden battle card claims",
] as const;

export const COMPETITOR_BATTLE_CARDS_EIGHT_CI_SCRIPTS = [
  "test:ci:competitor-battle-cards-eight",
] as const;

export type CompetitorBattleCardsEightAudit = {
  policyId: typeof COMPETITOR_BATTLE_CARDS_EIGHT_POLICY_ID;
  missingHeadings: string[];
  missingSlugs: string[];
  battleCardCount: number;
  passed: boolean;
};

export function auditCompetitorBattleCardsEightDoc(source: string): CompetitorBattleCardsEightAudit {
  const missingHeadings = COMPETITOR_BATTLE_CARDS_EIGHT_DOC_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const missingSlugs = COMPETITOR_BATTLE_CARDS_EIGHT_SLUGS.filter(
    (slug) =>
      !source.includes(`slug: \`${slug}\``) &&
      !source.includes(battleCardEightLabel(slug)),
  );
  const battleCardCount = COMPETITOR_BATTLE_CARDS_EIGHT_IDS.filter((id) =>
    source.includes(`### ${id} —`),
  ).length;

  return {
    policyId: COMPETITOR_BATTLE_CARDS_EIGHT_POLICY_ID,
    missingHeadings,
    missingSlugs,
    battleCardCount,
    passed:
      missingHeadings.length === 0 &&
      battleCardCount === COMPETITOR_BATTLE_CARDS_EIGHT_TOTAL &&
      COMPETITOR_BATTLE_CARDS_EIGHT_SLUGS.every((slug) =>
        source.includes(battleCardEightLabel(slug)),
      ),
  };
}

export function auditCompetitorBattleCardsEightDocFromRoot(
  root = process.cwd(),
): CompetitorBattleCardsEightAudit {
  const source = readFileSync(join(root, COMPETITOR_BATTLE_CARDS_EIGHT_DOC), "utf8");
  return auditCompetitorBattleCardsEightDoc(source);
}
