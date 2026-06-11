import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCompetitorBattleCardsP1_85,
  formatCompetitorBattleCardsP1_85AuditLines,
} from "@/lib/marketing/competitor-battle-cards-p1-85-audit";
import {
  COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES,
  getCompetitorBattleCardP1_85,
} from "@/lib/marketing/competitor-battle-cards-p1-85-content";
import {
  COMPETITOR_BATTLE_CARDS_P1_85_CI_WORKFLOW,
  COMPETITOR_BATTLE_CARDS_P1_85_COUNT,
  COMPETITOR_BATTLE_CARDS_P1_85_FRAMEWORK,
  COMPETITOR_BATTLE_CARDS_P1_85_INDEX_DOC,
  COMPETITOR_BATTLE_CARDS_P1_85_NPM_SCRIPT,
  COMPETITOR_BATTLE_CARDS_P1_85_POLICY_ID,
  COMPETITOR_BATTLE_CARDS_P1_85_SLUGS,
  COMPETITOR_BATTLE_CARDS_P1_85_UNIT_TEST,
  competitorBattleCardDocPath,
} from "@/lib/marketing/competitor-battle-cards-p1-85-policy";
import { COMPETITOR_PARITY_21_SLUGS } from "@/lib/competitor/absolute-final-competitor-parity-policy";

const ROOT = process.cwd();

describe("Competitor battle cards (P1-85)", () => {
  it("locks policy id, WIN-TRAP-REDIRECT framework, and 21 slugs", () => {
    expect(COMPETITOR_BATTLE_CARDS_P1_85_POLICY_ID).toBe("competitor-battle-cards-p1-85-v1");
    expect(COMPETITOR_BATTLE_CARDS_P1_85_FRAMEWORK).toBe("WIN-TRAP-REDIRECT");
    expect(COMPETITOR_BATTLE_CARDS_P1_85_COUNT).toBe(21);
    expect(COMPETITOR_BATTLE_CARDS_P1_85_SLUGS).toEqual([...COMPETITOR_PARITY_21_SLUGS]);
    expect(COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES).toHaveLength(21);
  });

  it("passes full competitor battle cards audit", () => {
    const summary = auditCompetitorBattleCardsP1_85(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.indexWired).toBe(true);
    expect(summary.parentDocWired).toBe(true);
    expect(summary.allPagesPresent).toBe(true);
    expect(summary.allPagesStructured).toBe(true);
    expect(summary.entryCountCorrect).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("maps toast and marginedge one-pagers with compare paths", () => {
    const toast = getCompetitorBattleCardP1_85("toast");
    const margin = getCompetitorBattleCardP1_85("marginedge");
    expect(toast?.comparePath).toBe("/compare/toast");
    expect(margin?.comparePath).toBe("/compare/marginedge");
    expect(existsSync(join(ROOT, competitorBattleCardDocPath("toast")))).toBe(true);
    expect(existsSync(join(ROOT, competitorBattleCardDocPath("marginedge")))).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, COMPETITOR_BATTLE_CARDS_P1_85_INDEX_DOC))).toBe(true);
    expect(existsSync(join(ROOT, COMPETITOR_BATTLE_CARDS_P1_85_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[COMPETITOR_BATTLE_CARDS_P1_85_NPM_SCRIPT]).toContain(
      "audit-competitor-battle-cards-p1-85.ts",
    );
    expect(pkg.scripts?.["test:ci:competitor-battle-cards-p1-85"]).toContain(
      COMPETITOR_BATTLE_CARDS_P1_85_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, COMPETITOR_BATTLE_CARDS_P1_85_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:competitor-battle-cards-p1-85");
  });

  it("formats audit lines", () => {
    const summary = auditCompetitorBattleCardsP1_85(ROOT);
    const lines = formatCompetitorBattleCardsP1_85AuditLines(summary);
    expect(lines.some((line) => line.includes(COMPETITOR_BATTLE_CARDS_P1_85_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
