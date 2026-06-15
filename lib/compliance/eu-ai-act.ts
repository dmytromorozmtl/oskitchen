import { toJsonValue } from "@/lib/prisma/json";
/**
 * S4 — EU AI Act transparency: assignment model card, human oversight log, risk tier.
 */

export type EuAiRiskTier = "minimal" | "limited" | "high";

export type EuAiModelCard = {
  at: string;
  systemName: string;
  purpose: string;
  assignmentMethod: string;
  personalData: boolean;
  humanOversightRequired: boolean;
  riskTier: EuAiRiskTier;
  version: string;
};

export type EuAiOversightEntry = {
  at: string;
  actorId: string;
  action: "approve_publish" | "reject_proposal" | "override_arm" | "disable_experiment";
  rationale: string;
};

export type EuAiActPack = {
  at: string;
  modelCard: EuAiModelCard;
  oversightLog: EuAiOversightEntry[];
  transparencyUrl: string | null;
};

export function isEuAiActPackEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_EU_AI_ACT === "1";
}

export function buildDefaultAssignmentModelCard(): EuAiModelCard {
  return {
    at: new Date().toISOString(),
    systemName: "OS Kitchen Theme Experiment Assigner",
    purpose: "Deterministic visitor-to-arm assignment for storefront A/B theme tests",
    assignmentMethod: "SHA-256 bucket + optional LinUCB/WASM/quantum-safe hybrid",
    personalData: false,
    humanOversightRequired: true,
    riskTier: "limited",
    version: "1.0.0",
  };
}

export function readEuAiActPack(raw: unknown): EuAiActPack | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).euAiActPack;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const p = o as Record<string, unknown>;
  return {
    at: typeof p.at === "string" ? p.at : new Date().toISOString(),
    modelCard: (p.modelCard as EuAiModelCard) ?? buildDefaultAssignmentModelCard(),
    oversightLog: Array.isArray(p.oversightLog) ? (p.oversightLog as EuAiOversightEntry[]) : [],
    transparencyUrl: typeof p.transparencyUrl === "string" ? p.transparencyUrl : null,
  };
}

export function mergeEuAiActPack(
  previousRaw: unknown,
  pack: EuAiActPack,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.euAiActPack = pack;
  return base;
}

export function appendEuAiOversightEntry(
  raw: unknown,
  entry: Omit<EuAiOversightEntry, "at">,
): Record<string, unknown> {
  const prev = readEuAiActPack(raw) ?? {
    at: new Date().toISOString(),
    modelCard: buildDefaultAssignmentModelCard(),
    oversightLog: [],
    transparencyUrl: process.env.EU_AI_ACT_TRANSPARENCY_URL ?? null,
  };
  const log = [
    ...prev.oversightLog,
    { ...entry, at: new Date().toISOString() },
  ].slice(-100);
  return mergeEuAiActPack(raw, { ...prev, oversightLog: log, at: new Date().toISOString() });
}

export function evaluateEuAiActPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isEuAiActPackEnabled()) {
    return { passed: true, headline: "EU AI Act pack off", detail: "" };
  }
  const pack = readEuAiActPack(raw);
  if (!pack) {
    return {
      passed: false,
      headline: "EU AI Act model card missing",
      detail: "Seed euAiActPack before publish in regulated regions.",
    };
  }
  if (pack.modelCard.riskTier === "high" && pack.oversightLog.length === 0) {
    return {
      passed: false,
      headline: "High-risk AI — human oversight required",
      detail: "Log approve_publish or override before concluding.",
    };
  }
  return {
    passed: true,
    headline: `EU AI Act ${pack.modelCard.riskTier} risk`,
    detail: `${pack.oversightLog.length} oversight entries · ${pack.modelCard.assignmentMethod}`,
  };
}
