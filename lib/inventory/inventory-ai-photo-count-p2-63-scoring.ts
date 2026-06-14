import {
  INVENTORY_AI_PHOTO_COUNT_P2_63_MAX_HALLUCINATION_PCT,
  INVENTORY_AI_PHOTO_COUNT_P2_63_MIN_RECALL_PCT,
  INVENTORY_AI_PHOTO_COUNT_P2_63_SCENARIO_COUNT,
} from "@/lib/inventory/inventory-ai-photo-count-p2-63-policy";
import {
  buildInventoryAiPhotoCountCorpusP263,
  type InventoryAiPhotoCountScenario,
  type ShelfCountExpectedItem,
} from "@/lib/inventory/inventory-ai-photo-count-p2-63-corpus";
import type { ShelfItemDetection } from "@/lib/inventory/inventory-photo-count-types";

export type ShelfCountScenarioScore = {
  scenarioId: string;
  expectedCount: number;
  matchedCount: number;
  recallPct: number;
  unexpectedLabels: string[];
};

export type InventoryAiPhotoCountBenchmarkP263Result = {
  scenarioCount: number;
  itemRecallPct: number;
  hallucinationPct: number;
  passed: boolean;
  thresholdRecallPct: number;
  maxHallucinationPct: number;
  scenarioScores: ShelfCountScenarioScore[];
};

export function normalizeShelfLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

export function shelfLabelsMatch(a: string, b: string): boolean {
  const na = normalizeShelfLabel(a);
  const nb = normalizeShelfLabel(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

export function findMatchingDetection(
  expected: ShelfCountExpectedItem,
  detections: readonly ShelfItemDetection[],
  usedIndexes: Set<number>,
): ShelfItemDetection | null {
  for (let i = 0; i < detections.length; i += 1) {
    if (usedIndexes.has(i)) continue;
    const detection = detections[i]!;
    if (shelfLabelsMatch(expected.label, detection.label)) {
      usedIndexes.add(i);
      return detection;
    }
  }
  return null;
}

export function scoreShelfCountScenario(
  scenario: InventoryAiPhotoCountScenario,
): ShelfCountScenarioScore {
  const usedIndexes = new Set<number>();
  let matchedCount = 0;
  const matchedDetectionIndexes = new Set<number>();

  for (const expected of scenario.expectedItems) {
    const match = findMatchingDetection(expected, scenario.detections, usedIndexes);
    if (match && match.quantity === expected.quantity) {
      matchedCount += 1;
      const idx = scenario.detections.indexOf(match);
      if (idx >= 0) matchedDetectionIndexes.add(idx);
    }
  }

  const unexpectedLabels = scenario.detections
    .filter((_, idx) => !matchedDetectionIndexes.has(idx))
    .map((d) => d.label);

  const recallPct =
    scenario.expectedItems.length === 0
      ? 100
      : Math.round((matchedCount / scenario.expectedItems.length) * 100);

  return {
    scenarioId: scenario.id,
    expectedCount: scenario.expectedItems.length,
    matchedCount,
    recallPct,
    unexpectedLabels,
  };
}

export function runInventoryAiPhotoCountBenchmarkP263(
  scenarios: InventoryAiPhotoCountScenario[] = buildInventoryAiPhotoCountCorpusP263(),
): InventoryAiPhotoCountBenchmarkP263Result {
  const scenarioScores = scenarios.map(scoreShelfCountScenario);

  const totalExpected = scenarioScores.reduce((sum, s) => sum + s.expectedCount, 0);
  const totalMatched = scenarioScores.reduce((sum, s) => sum + s.matchedCount, 0);
  const itemRecallPct =
    totalExpected === 0 ? 0 : Math.round((totalMatched / totalExpected) * 100);

  const hallucinationScenarios = scenarioScores.filter((s) => s.unexpectedLabels.length > 0).length;
  const hallucinationPct =
    scenarios.length === 0
      ? 100
      : Math.round((hallucinationScenarios / scenarios.length) * 100);

  const passed =
    scenarios.length >= INVENTORY_AI_PHOTO_COUNT_P2_63_SCENARIO_COUNT &&
    itemRecallPct >= INVENTORY_AI_PHOTO_COUNT_P2_63_MIN_RECALL_PCT &&
    hallucinationPct <= INVENTORY_AI_PHOTO_COUNT_P2_63_MAX_HALLUCINATION_PCT;

  return {
    scenarioCount: scenarios.length,
    itemRecallPct,
    hallucinationPct,
    passed,
    thresholdRecallPct: INVENTORY_AI_PHOTO_COUNT_P2_63_MIN_RECALL_PCT,
    maxHallucinationPct: INVENTORY_AI_PHOTO_COUNT_P2_63_MAX_HALLUCINATION_PCT,
    scenarioScores,
  };
}

export function parseShelfCountJson(raw: Record<string, unknown>): {
  shelfLabel: string | null;
  detections: ShelfItemDetection[];
  confidence: number;
} {
  const shelfLabel =
    typeof raw.shelfLabel === "string" && raw.shelfLabel.trim() ? raw.shelfLabel.trim() : null;
  const items = Array.isArray(raw.items) ? raw.items : [];
  const detections: ShelfItemDetection[] = items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const label = String(row.label ?? row.name ?? "").trim();
      if (!label) return null;
      const quantity = Number(row.quantity ?? row.count ?? 0);
      const confidence = Number(row.confidence ?? 0.85);
      return {
        label,
        quantity: Number.isFinite(quantity) ? Math.max(0, Math.round(quantity)) : 0,
        confidence: Number.isFinite(confidence) ? Math.min(1, Math.max(0, confidence)) : 0.85,
      };
    })
    .filter((d): d is ShelfItemDetection => d !== null);

  const confidence = Number(raw.confidence ?? 0.85);
  return {
    shelfLabel,
    detections,
    confidence: Number.isFinite(confidence) ? Math.min(1, Math.max(0, confidence)) : 0.85,
  };
}

export function matchDetectionsToIngredients(
  detections: readonly ShelfItemDetection[],
  ingredients: readonly { id: string; name: string }[],
): Array<{
  ingredientId: string | null;
  ingredientName: string;
  detectedLabel: string;
  quantity: number;
  confidence: number;
}> {
  const usedIngredientIds = new Set<string>();

  return detections.map((detection) => {
    const normalized = normalizeShelfLabel(detection.label);
    const match = ingredients.find((ing) => {
      if (usedIngredientIds.has(ing.id)) return false;
      const ingNorm = normalizeShelfLabel(ing.name);
      return ingNorm === normalized || ingNorm.includes(normalized) || normalized.includes(ingNorm);
    });

    if (match) usedIngredientIds.add(match.id);

    return {
      ingredientId: match?.id ?? null,
      ingredientName: match?.name ?? detection.label,
      detectedLabel: detection.label,
      quantity: detection.quantity,
      confidence: detection.confidence,
    };
  });
}

/** Inject wrong quantity to prove benchmark gate fails. */
export function buildDegradedInventoryAiPhotoCountP263Scenarios(
  scenarios: InventoryAiPhotoCountScenario[],
): InventoryAiPhotoCountScenario[] {
  return scenarios.map((scenario, index) =>
    index === 0
      ? {
          ...scenario,
          detections: scenario.detections.map((d, di) =>
            di === 0 ? { ...d, quantity: d.quantity + 99 } : d,
          ),
        }
      : scenario,
  );
}
