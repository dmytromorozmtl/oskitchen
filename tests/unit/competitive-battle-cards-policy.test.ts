import { describe, expect, it } from "vitest";

import {
  auditCompetitiveBattleCardsDoc,
  BATTLE_CARD_FRAMEWORK,
  COMPETITIVE_BATTLE_CARDS,
  COMPETITIVE_BATTLE_CARDS_POLICY_ID,
  COMPETITIVE_BATTLE_CARDS_SUPPLEMENTARY,
  getBattleCardById,
  getBattleCardBySlug,
  lintBattleCardCopy,
  listCompetitiveBattleCardIds,
} from "@/lib/marketing/competitive-battle-cards-policy";

describe("competitive battle cards policy (eight core + supplementary)", () => {
  it("locks eight-card policy id and BC1–BC8", () => {
    expect(COMPETITIVE_BATTLE_CARDS_POLICY_ID).toBe(
      "competitive-battle-cards-eight-absolute-final-v1",
    );
    expect(COMPETITIVE_BATTLE_CARDS).toHaveLength(8);
    expect(BATTLE_CARD_FRAMEWORK).toBe("WIN-TRAP-REDIRECT");
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
  });

  it("maps BC4 clover and BC8 olo with compare paths", () => {
    expect(getBattleCardById("BC4")?.slug).toBe("clover");
    expect(getBattleCardById("BC4")?.comparePath).toBe("/compare/restaurant-pos");
    expect(getBattleCardById("BC8")?.slug).toBe("olo");
    expect(getBattleCardById("BC8")?.comparePath).toBe("/compare/olo");
    expect(getBattleCardBySlug("toast")?.id).toBe("BC1");
  });

  it("retains supplementary deliverect card as BC-S1", () => {
    const deliverect = COMPETITIVE_BATTLE_CARDS_SUPPLEMENTARY.find(
      (card) => card.slug === "deliverect",
    );
    expect(deliverect?.id).toBe("BC-S1");
    expect(deliverect?.comparePath).toBe("/compare/deliverect");
  });

  it("passes audit on canonical competitive battle cards doc", () => {
    const audit = auditCompetitiveBattleCardsDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.battleCardCount).toBe(8);
  });

  it("flags forbidden battle card override claims", () => {
    const result = lintBattleCardCopy(
      "We beat Toast on everything with Deliverect parity and live DoorDash today — thousands of customers.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest competitive positioning copy", () => {
    const result = lintBattleCardCopy(
      "Toast wins on hardware; we target ghost kitchen ops with honest BETA labels and Integration Health SKIPPED visibility.",
    );
    expect(result.passed).toBe(true);
  });
});
