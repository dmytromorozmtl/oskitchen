import { describe, expect, it } from "vitest";

import {
  auditCompetitorBattleCardsEightDoc,
  auditCompetitorBattleCardsEightDocFromRoot,
  COMPETITOR_BATTLE_CARDS_EIGHT_CI_SCRIPTS,
  COMPETITOR_BATTLE_CARDS_EIGHT_POLICY_ID,
  COMPETITOR_BATTLE_CARDS_EIGHT_SLUGS,
  COMPETITOR_BATTLE_CARDS_EIGHT_TOTAL,
} from "@/lib/competitor/competitor-battle-cards-eight-policy";
import {
  auditCompetitiveBattleCardsDoc,
  COMPETITIVE_BATTLE_CARDS,
  COMPETITIVE_BATTLE_CARDS_POLICY_ID,
  COMPETITIVE_BATTLE_CARDS_SUPPLEMENTARY,
  getBattleCardById,
  getBattleCardBySlug,
  listCompetitiveBattleCardIds,
} from "@/lib/marketing/competitive-battle-cards-policy";

describe("competitor battle cards eight (Absolute Final Task 32)", () => {
  it("locks eight-card policy id and competitor slugs", () => {
    expect(COMPETITOR_BATTLE_CARDS_EIGHT_POLICY_ID).toBe(
      "competitor-battle-cards-eight-absolute-final-v1",
    );
    expect(COMPETITOR_BATTLE_CARDS_EIGHT_TOTAL).toBe(8);
    expect(COMPETITOR_BATTLE_CARDS_EIGHT_SLUGS).toEqual([
      "toast",
      "square",
      "lightspeed",
      "clover",
      "revel",
      "touchbistro",
      "spoton",
      "olo",
    ]);
    expect(COMPETITOR_BATTLE_CARDS_EIGHT_CI_SCRIPTS).toContain(
      "test:ci:competitor-battle-cards-eight",
    );
  });

  it("passes eight-card doc audit from repo root", () => {
    const audit = auditCompetitorBattleCardsEightDocFromRoot();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.missingSlugs).toEqual([]);
    expect(audit.battleCardCount).toBe(8);
  });

  it("aligns marketing policy with eight core cards and supplementary MKT-26 cards", () => {
    expect(COMPETITIVE_BATTLE_CARDS_POLICY_ID).toBe(
      "competitive-battle-cards-eight-absolute-final-v1",
    );
    expect(COMPETITIVE_BATTLE_CARDS).toHaveLength(8);
    expect(COMPETITIVE_BATTLE_CARDS_SUPPLEMENTARY).toHaveLength(3);
    expect(listCompetitiveBattleCardIds()).toEqual([
      "BC1",
      "BC2",
      "BC3",
      "BC4",
      "BC5",
      "BC6",
      "BC7",
      "BC8",
    ]);
    expect(getBattleCardById("BC4")?.slug).toBe("clover");
    expect(getBattleCardBySlug("olo")?.id).toBe("BC8");
    expect(auditCompetitiveBattleCardsDoc().passed).toBe(true);
  });

  it("flags missing competitor slug in doc audit", () => {
    const audit = auditCompetitorBattleCardsEightDoc(
      "# Eight battle cards\n### BC1 — Toast\nToast\n",
    );
    expect(audit.passed).toBe(false);
    expect(audit.battleCardCount).toBeLessThan(8);
  });
});
