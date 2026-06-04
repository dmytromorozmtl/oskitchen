import { describe, expect, it } from "vitest";

import {
  auditCompetitiveBattleCardsDoc,
  BATTLE_CARD_FRAMEWORK,
  COMPETITIVE_BATTLE_CARDS,
  COMPETITIVE_BATTLE_CARDS_POLICY_ID,
  getBattleCardById,
  getBattleCardBySlug,
  lintBattleCardCopy,
  listCompetitiveBattleCardIds,
} from "@/lib/marketing/competitive-battle-cards-policy";

describe("competitive battle cards policy (MKT-26)", () => {
  it("locks MKT-26 policy id and seven battle cards", () => {
    expect(COMPETITIVE_BATTLE_CARDS_POLICY_ID).toBe(
      "competitive-battle-cards-mkt26-v1",
    );
    expect(COMPETITIVE_BATTLE_CARDS).toHaveLength(7);
    expect(BATTLE_CARD_FRAMEWORK).toBe("WIN-TRAP-REDIRECT");
    expect(listCompetitiveBattleCardIds()).toEqual([
      "BC1",
      "BC2",
      "BC3",
      "BC4",
      "BC5",
      "BC6",
      "BC7",
    ]);
  });

  it("maps BC4 deliverect battle card with compare path", () => {
    const bc4 = getBattleCardById("BC4");
    expect(bc4?.slug).toBe("deliverect");
    expect(bc4?.comparePath).toBe("/compare/deliverect");
    expect(getBattleCardBySlug("toast")?.id).toBe("BC1");
  });

  it("passes audit on canonical competitive battle cards doc", () => {
    const audit = auditCompetitiveBattleCardsDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.battleCardCount).toBe(7);
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
