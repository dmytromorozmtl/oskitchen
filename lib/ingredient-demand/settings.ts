import { prisma } from "@/lib/prisma";

import { DEMAND_SOURCE_CATALOG } from "./demand-sources";
import type { DemandSourceType } from "./types";

export type SourceToggleConfig = {
  enabled: boolean;
  confidence: number;
};

export type IngredientDemandSettings = {
  globalWasteBufferPercent: number;
  ingredientWasteBufferPercentById: Record<string, number>;
  batchRounding: "none" | "ceil" | "floor";
  enabledSources: Partial<Record<DemandSourceType, SourceToggleConfig>>;
};

const DEFAULT_SETTINGS: IngredientDemandSettings = {
  globalWasteBufferPercent: 5,
  ingredientWasteBufferPercentById: {},
  batchRounding: "none",
  enabledSources: Object.fromEntries(
    DEMAND_SOURCE_CATALOG.map((s) => [
      s.id,
      { enabled: s.defaultEnabled, confidence: s.defaultConfidence },
    ]),
  ) as IngredientDemandSettings["enabledSources"],
};

export function defaultIngredientDemandSettings(): IngredientDemandSettings {
  return JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) as IngredientDemandSettings;
}

export function mergeIngredientDemandSettings(raw: unknown): IngredientDemandSettings {
  const base = defaultIngredientDemandSettings();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  if (typeof o.globalWasteBufferPercent === "number" && Number.isFinite(o.globalWasteBufferPercent)) {
    base.globalWasteBufferPercent = Math.max(0, Math.min(100, o.globalWasteBufferPercent));
  }
  if (o.ingredientWasteBufferPercentById && typeof o.ingredientWasteBufferPercentById === "object") {
    base.ingredientWasteBufferPercentById = { ...base.ingredientWasteBufferPercentById };
    for (const [k, v] of Object.entries(o.ingredientWasteBufferPercentById as Record<string, unknown>)) {
      if (typeof v === "number" && Number.isFinite(v)) {
        base.ingredientWasteBufferPercentById[k] = Math.max(0, Math.min(100, v));
      }
    }
  }
  if (o.batchRounding === "ceil" || o.batchRounding === "floor" || o.batchRounding === "none") {
    base.batchRounding = o.batchRounding;
  }
  if (o.enabledSources && typeof o.enabledSources === "object") {
    for (const [k, v] of Object.entries(o.enabledSources as Record<string, unknown>)) {
      if (!v || typeof v !== "object") continue;
      const cfg = v as Record<string, unknown>;
      const prev = base.enabledSources[k as DemandSourceType] ?? { enabled: false, confidence: 0.5 };
      base.enabledSources[k as DemandSourceType] = {
        enabled: typeof cfg.enabled === "boolean" ? cfg.enabled : prev.enabled,
        confidence:
          typeof cfg.confidence === "number" && Number.isFinite(cfg.confidence)
            ? Math.max(0, Math.min(1, cfg.confidence))
            : prev.confidence,
      };
    }
  }
  return base;
}

export async function loadIngredientDemandSettingsForUser(userId: string): Promise<IngredientDemandSettings> {
  const ks = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { ingredientDemandSettingsJson: true, businessType: true },
  });
  const merged = mergeIngredientDemandSettings(ks?.ingredientDemandSettingsJson ?? undefined);
  if (ks?.businessType) {
    for (const s of DEMAND_SOURCE_CATALOG) {
      if (s.relevantBusinessTypes.includes(ks.businessType) && s.defaultEnabled) {
        const cur = merged.enabledSources[s.id];
        if (!cur) merged.enabledSources[s.id] = { enabled: true, confidence: s.defaultConfidence };
      }
    }
  }
  return merged;
}
