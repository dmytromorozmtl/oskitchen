/**
 * U4 — US Executive Order 14110 AI inventory alignment (extends T4 UK + S4 EU packs).
 */

import { readEuAiActPack, isEuAiActPackEnabled } from "@/lib/compliance/eu-ai-act";
import { toJsonValue } from "@/lib/prisma/json";
import { readUkAiSafetyPack, isUkAiSafetyEnabled } from "@/lib/compliance/uk-ai-safety";
import { readAutonomousScientist } from "@/lib/storefront/theme-experiment-autonomous-scientist";

export type Eo14110ModelInventoryEntry = {
  at: string;
  modelId: string;
  provider: string;
  useCase: string;
  dualUseScreened: boolean;
  nationalSecuritySensitive: boolean;
};

export type Eo14110IncidentEntry = {
  at: string;
  incidentId: string;
  severity: "low" | "medium" | "high";
  description: string;
  remediated: boolean;
};

export type Eo14110AiInventoryPack = {
  at: string;
  modelInventory: Eo14110ModelInventoryEntry[];
  dualUseScreeningPassed: boolean;
  incidents: Eo14110IncidentEntry[];
  reportingUrl: string | null;
};

export function isEo14110InventoryEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_EO_14110_INVENTORY === "1";
}

export function buildDefaultModelInventory(): Eo14110ModelInventoryEntry[] {
  return [
    {
      at: new Date().toISOString(),
      modelId: "kos-theme-assigner-v1",
      provider: "KitchenOS",
      useCase: "Deterministic theme experiment assignment",
      dualUseScreened: true,
      nationalSecuritySensitive: false,
    },
    {
      at: new Date().toISOString(),
      modelId: process.env.EO_14110_SCIENTIST_MODEL_ID ?? "kos-autonomous-scientist",
      provider: process.env.EO_14110_SCIENTIST_PROVIDER ?? "KitchenOS",
      useCase: "Experiment hypothesis proposals and guardrailed conclude",
      dualUseScreened: true,
      nationalSecuritySensitive: false,
    },
  ];
}

export function readEo14110InventoryPack(raw: unknown): Eo14110AiInventoryPack | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).eo14110AiInventory;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const p = o as Record<string, unknown>;
  return {
    at: typeof p.at === "string" ? p.at : new Date().toISOString(),
    modelInventory: Array.isArray(p.modelInventory)
      ? (p.modelInventory as Eo14110ModelInventoryEntry[])
      : [],
    dualUseScreeningPassed: p.dualUseScreeningPassed === true,
    incidents: Array.isArray(p.incidents) ? (p.incidents as Eo14110IncidentEntry[]) : [],
    reportingUrl: typeof p.reportingUrl === "string" ? p.reportingUrl : null,
  };
}

export function mergeEo14110InventoryPack(
  previousRaw: unknown,
  pack: Eo14110AiInventoryPack,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.eo14110AiInventory = pack;
  return base;
}

export function seedEo14110FromEuUkPacks(raw: unknown): Eo14110AiInventoryPack {
  const eu = readEuAiActPack(raw);
  const uk = readUkAiSafetyPack(raw);
  const scientist = readAutonomousScientist(raw);
  const unscreened = scientist?.proposals.some((p) => p.riskTier === "high" && p.status === "running");

  return {
    at: new Date().toISOString(),
    modelInventory: buildDefaultModelInventory(),
    dualUseScreeningPassed: !unscreened && (uk?.capabilityEvals.every((e) => e.passed) ?? true),
    incidents: [],
    reportingUrl: process.env.EO_14110_REPORTING_URL ?? eu?.transparencyUrl ?? null,
  };
}

export function evaluateEo14110InventoryPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isEo14110InventoryEnabled()) {
    return { passed: true, headline: "EO 14110 inventory off", detail: "" };
  }
  if (!isEuAiActPackEnabled()) {
    return {
      passed: false,
      headline: "EU AI Act required for EO 14110 pack",
      detail: "Enable THEME_EXPERIMENT_EU_AI_ACT=1.",
    };
  }
  if (isUkAiSafetyEnabled() && !readUkAiSafetyPack(raw)) {
    return {
      passed: false,
      headline: "UK AI Safety pack required",
      detail: "Seed ukAiSafetyPack before EO 14110 in US federal contexts.",
    };
  }
  const pack = readEo14110InventoryPack(raw);
  if (!pack) {
    return {
      passed: false,
      headline: "EO 14110 model inventory missing",
      detail: "Run eo-14110-inventory-seed cron.",
    };
  }
  if (!pack.dualUseScreeningPassed) {
    return {
      passed: false,
      headline: "Dual-use screening failed",
      detail: "High-risk scientist runs must be cleared before publish.",
    };
  }
  const openIncidents = pack.incidents.filter((i) => !i.remediated && i.severity === "high");
  if (openIncidents.length > 0) {
    return {
      passed: false,
      headline: "Open high-severity AI incidents",
      detail: `${openIncidents.length} incidents require remediation log.`,
    };
  }
  return {
    passed: true,
    headline: `EO 14110 OK (${pack.modelInventory.length} models)`,
    detail: `Dual-use screened · ${pack.incidents.length} incidents logged`,
  };
}
