import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCompetitorBattleCardsP3_136,
  formatCompetitorBattleCardsP3_136AuditLines,
} from "@/lib/pm/competitor-battle-cards-p3-136-audit";
import {
  loadCompetitorBattleCardsPmRegistry,
  validateCompetitorBattleCardsPmRegistry,
} from "@/lib/pm/competitor-battle-cards-p3-136-operations";
import {
  COMPETITOR_BATTLE_CARDS_P3_136_CARD_COUNT,
  COMPETITOR_BATTLE_CARDS_P3_136_CI_WORKFLOW,
  COMPETITOR_BATTLE_CARDS_P3_136_DOC,
  COMPETITOR_BATTLE_CARDS_P3_136_FRAMEWORK,
  COMPETITOR_BATTLE_CARDS_P3_136_NPM_SCRIPT,
  COMPETITOR_BATTLE_CARDS_P3_136_POLICY_ID,
  COMPETITOR_BATTLE_CARDS_P3_136_UNIT_TEST,
} from "@/lib/pm/competitor-battle-cards-p3-136-policy";

const ROOT = process.cwd();

describe("Competitor battle cards PM (P3-136)", () => {
  it("locks policy id and 21-card target", () => {
    expect(COMPETITOR_BATTLE_CARDS_P3_136_POLICY_ID).toBe(
      "competitor-battle-cards-p3-136-v1",
    );
    expect(COMPETITOR_BATTLE_CARDS_P3_136_CARD_COUNT).toBe(21);
    expect(COMPETITOR_BATTLE_CARDS_P3_136_FRAMEWORK).toBe("WIN-TRAP-REDIRECT");
  });

  it("validates registry with 21 published cards matching P1-85 content", () => {
    const registry = loadCompetitorBattleCardsPmRegistry(ROOT);
    const validation = validateCompetitorBattleCardsPmRegistry(registry);
    expect(validation.valid).toBe(true);
    expect(validation.allPublished).toBe(true);
    expect(registry.cards).toHaveLength(21);
    expect(registry.cards[0]?.cardId).toBe("BC01");
    expect(registry.cards[20]?.cardId).toBe("BC21");
  });

  it("passes full competitor battle cards PM audit", () => {
    const summary = auditCompetitorBattleCardsP3_136(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.liveP1_85AuditPassed).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.cardsDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, COMPETITOR_BATTLE_CARDS_P3_136_DOC))).toBe(true);
    expect(existsSync(join(ROOT, COMPETITOR_BATTLE_CARDS_P3_136_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[COMPETITOR_BATTLE_CARDS_P3_136_NPM_SCRIPT]).toContain(
      "audit-competitor-battle-cards-p3-136.ts",
    );
    expect(pkg.scripts?.["test:ci:competitor-battle-cards-p3-136"]).toContain(
      COMPETITOR_BATTLE_CARDS_P3_136_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, COMPETITOR_BATTLE_CARDS_P3_136_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:competitor-battle-cards-p3-136");
  });

  it("formats audit lines", () => {
    const summary = auditCompetitorBattleCardsP3_136(ROOT);
    const lines = formatCompetitorBattleCardsP3_136AuditLines(summary);
    expect(lines.some((line) => line.includes(COMPETITOR_BATTLE_CARDS_P3_136_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
