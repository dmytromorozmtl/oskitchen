import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditInventoryAiPhotoCountP263,
  formatInventoryAiPhotoCountP263AuditLines,
} from "@/lib/inventory/inventory-ai-photo-count-p2-63-audit";
import { buildInventoryAiPhotoCountCorpusP263 } from "@/lib/inventory/inventory-ai-photo-count-p2-63-corpus";
import {
  INVENTORY_AI_PHOTO_COUNT_P2_63_ARTIFACT,
  INVENTORY_AI_PHOTO_COUNT_P2_63_CHECK_NPM_SCRIPT,
  INVENTORY_AI_PHOTO_COUNT_P2_63_CI_NPM_SCRIPT,
  INVENTORY_AI_PHOTO_COUNT_P2_63_CI_WORKFLOW,
  INVENTORY_AI_PHOTO_COUNT_P2_63_DOC,
  INVENTORY_AI_PHOTO_COUNT_P2_63_FLOW_STEPS,
  INVENTORY_AI_PHOTO_COUNT_P2_63_MAX_HALLUCINATION_PCT,
  INVENTORY_AI_PHOTO_COUNT_P2_63_MIN_RECALL_PCT,
  INVENTORY_AI_PHOTO_COUNT_P2_63_POLICY_ID,
  INVENTORY_AI_PHOTO_COUNT_P2_63_SCENARIO_COUNT,
  INVENTORY_AI_PHOTO_COUNT_P2_63_UNIT_TEST,
  INVENTORY_AI_PHOTO_COUNT_P2_63_WIRING_PATHS,
} from "@/lib/inventory/inventory-ai-photo-count-p2-63-policy";
import {
  buildDegradedInventoryAiPhotoCountP263Scenarios,
  matchDetectionsToIngredients,
  parseShelfCountJson,
  runInventoryAiPhotoCountBenchmarkP263,
  shelfLabelsMatch,
} from "@/lib/inventory/inventory-ai-photo-count-p2-63-scoring";

const ROOT = process.cwd();

describe("Inventory AI photo count — MarketMan parity (P2-63)", () => {
  it("locks P2-63 policy, 15 scenarios, and flow steps", () => {
    expect(INVENTORY_AI_PHOTO_COUNT_P2_63_POLICY_ID).toBe("inventory-ai-photo-count-p2-63-v1");
    expect(INVENTORY_AI_PHOTO_COUNT_P2_63_SCENARIO_COUNT).toBe(15);
    expect(INVENTORY_AI_PHOTO_COUNT_P2_63_MIN_RECALL_PCT).toBe(90);
    expect(INVENTORY_AI_PHOTO_COUNT_P2_63_MAX_HALLUCINATION_PCT).toBe(0);
    expect(INVENTORY_AI_PHOTO_COUNT_P2_63_FLOW_STEPS).toEqual([
      "photo-capture",
      "ai-shelf-count",
      "match-ingredients",
      "apply-to-count",
    ]);
  });

  it("parses shelf count JSON and matches ingredient labels", () => {
    const parsed = parseShelfCountJson({
      shelfLabel: "Walk-in cooler",
      confidence: 0.91,
      items: [{ label: "Tomatoes", quantity: 12, confidence: 0.9 }],
    });
    expect(parsed.detections).toHaveLength(1);
    expect(parsed.detections[0]?.quantity).toBe(12);
    expect(shelfLabelsMatch("chicken breast", "CHICKEN BREAST")).toBe(true);

    const matched = matchDetectionsToIngredients(parsed.detections, [
      { id: "ing-1", name: "Tomatoes" },
    ]);
    expect(matched[0]?.ingredientId).toBe("ing-1");
  });

  it("passes 15-scenario golden corpus at 100% recall", () => {
    const corpus = buildInventoryAiPhotoCountCorpusP263();
    expect(corpus.length).toBe(15);

    const result = runInventoryAiPhotoCountBenchmarkP263(corpus);
    expect(result.itemRecallPct).toBe(100);
    expect(result.hallucinationPct).toBe(0);
    expect(result.passed).toBe(true);
  });

  it("fails when degraded scenarios inject wrong quantities", () => {
    const degraded = buildDegradedInventoryAiPhotoCountP263Scenarios(
      buildInventoryAiPhotoCountCorpusP263(),
    );
    const result = runInventoryAiPhotoCountBenchmarkP263(degraded);
    expect(result.passed).toBe(false);
  });

  it("passes full P2-63 inventory AI photo count audit", () => {
    const summary = auditInventoryAiPhotoCountP263(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.actionWired).toBe(true);
    expect(summary.panelWired).toBe(true);
    expect(summary.countsPageWired).toBe(true);
    expect(summary.corpusLoaded).toBe(true);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.itemRecallPct).toBeGreaterThanOrEqual(90);
    expect(summary.hallucinationPct).toBe(0);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-63 wiring paths, CI gate, and artifact", () => {
    for (const path of INVENTORY_AI_PHOTO_COUNT_P2_63_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[INVENTORY_AI_PHOTO_COUNT_P2_63_CHECK_NPM_SCRIPT]).toContain(
      INVENTORY_AI_PHOTO_COUNT_P2_63_UNIT_TEST,
    );
    expect(pkg.scripts?.[INVENTORY_AI_PHOTO_COUNT_P2_63_CI_NPM_SCRIPT]).toContain(
      INVENTORY_AI_PHOTO_COUNT_P2_63_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, INVENTORY_AI_PHOTO_COUNT_P2_63_CI_WORKFLOW), "utf8");
    expect(ci).toContain(INVENTORY_AI_PHOTO_COUNT_P2_63_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, INVENTORY_AI_PHOTO_COUNT_P2_63_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(INVENTORY_AI_PHOTO_COUNT_P2_63_POLICY_ID);
    expect(artifact.scenarioCount).toBe(15);

    const doc = readFileSync(join(ROOT, INVENTORY_AI_PHOTO_COUNT_P2_63_DOC), "utf8");
    expect(doc).toContain(INVENTORY_AI_PHOTO_COUNT_P2_63_POLICY_ID);
    expect(doc).toContain("MarketMan");
  });

  it("formats audit lines", () => {
    const summary = auditInventoryAiPhotoCountP263(ROOT);
    const lines = formatInventoryAiPhotoCountP263AuditLines(summary);
    expect(lines.some((line) => line.includes(INVENTORY_AI_PHOTO_COUNT_P2_63_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
