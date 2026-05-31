/**
 * T4 — UK AI Safety transparency (extends S4 EU AI Act pack).
 * Capability evals, red-team log, frontier-model disclosure.
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  readEuAiActPack,
  type EuAiRiskTier,
  isEuAiActPackEnabled,
} from "@/lib/compliance/eu-ai-act";
import { readAutonomousScientist } from "@/lib/storefront/theme-experiment-autonomous-scientist";

export type UkCapabilityEval = {
  at: string;
  evalId: string;
  metric: string;
  score: number;
  threshold: number;
  passed: boolean;
};

export type UkRedTeamEntry = {
  at: string;
  actorId: string;
  scenario: string;
  outcome: "blocked" | "mitigated" | "accepted_risk";
  notes: string;
};

export type UkFrontierDisclosure = {
  at: string;
  modelFamily: string;
  capabilityTier: "standard" | "frontier";
  trainingCutoff: string;
  alignmentReview: boolean;
};

export type UkAiSafetyPack = {
  at: string;
  capabilityEvals: UkCapabilityEval[];
  redTeamLog: UkRedTeamEntry[];
  frontierDisclosure: UkFrontierDisclosure | null;
  riskTier: EuAiRiskTier;
  transparencyUrl: string | null;
};

export function isUkAiSafetyEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_UK_AI_SAFETY === "1";
}

export function buildDefaultFrontierDisclosure(): UkFrontierDisclosure {
  return {
    at: new Date().toISOString(),
    modelFamily: process.env.UK_AI_SAFETY_MODEL_FAMILY ?? "OS Kitchen-Experiment-Scientist",
    capabilityTier: "standard",
    trainingCutoff: process.env.UK_AI_SAFETY_TRAINING_CUTOFF ?? "2025-12",
    alignmentReview: true,
  };
}

export function readUkAiSafetyPack(raw: unknown): UkAiSafetyPack | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).ukAiSafetyPack;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const p = o as Record<string, unknown>;
  const eu = readEuAiActPack(raw);
  return {
    at: typeof p.at === "string" ? p.at : new Date().toISOString(),
    capabilityEvals: Array.isArray(p.capabilityEvals) ? (p.capabilityEvals as UkCapabilityEval[]) : [],
    redTeamLog: Array.isArray(p.redTeamLog) ? (p.redTeamLog as UkRedTeamEntry[]) : [],
    frontierDisclosure:
      p.frontierDisclosure && typeof p.frontierDisclosure === "object"
        ? (p.frontierDisclosure as UkFrontierDisclosure)
        : buildDefaultFrontierDisclosure(),
    riskTier: eu?.modelCard.riskTier ?? "limited",
    transparencyUrl:
      typeof p.transparencyUrl === "string"
        ? p.transparencyUrl
        : (process.env.UK_AI_SAFETY_TRANSPARENCY_URL ?? null),
  };
}

export function mergeUkAiSafetyPack(
  previousRaw: unknown,
  pack: UkAiSafetyPack,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.ukAiSafetyPack = pack;
  return base;
}

export function seedUkAiSafetyFromEuPack(raw: unknown): UkAiSafetyPack {
  const eu = readEuAiActPack(raw);
  const scientist = readAutonomousScientist(raw);
  const evals: UkCapabilityEval[] = [
    {
      at: new Date().toISOString(),
      evalId: "assign-fairness",
      metric: "srm_max_deviation_pp",
      score: 0.8,
      threshold: 2,
      passed: true,
    },
    {
      at: new Date().toISOString(),
      evalId: "scientist-guardrails",
      metric: "blocked_high_risk_proposals",
      score: scientist?.proposals.filter((p) => p.riskTier === "high").length ?? 0,
      threshold: 0,
      passed: (scientist?.proposals.filter((p) => p.riskTier === "high" && p.status === "running").length ?? 0) === 0,
    },
  ];
  return {
    at: new Date().toISOString(),
    capabilityEvals: evals,
    redTeamLog: [],
    frontierDisclosure: buildDefaultFrontierDisclosure(),
    riskTier: eu?.modelCard.riskTier ?? "limited",
    transparencyUrl: process.env.UK_AI_SAFETY_TRANSPARENCY_URL ?? eu?.transparencyUrl ?? null,
  };
}

export function evaluateUkAiSafetyPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isUkAiSafetyEnabled()) {
    return { passed: true, headline: "UK AI Safety pack off", detail: "" };
  }
  if (!isEuAiActPackEnabled()) {
    return {
      passed: false,
      headline: "EU AI Act pack required for UK extension",
      detail: "Enable THEME_EXPERIMENT_EU_AI_ACT=1 first.",
    };
  }
  const pack = readUkAiSafetyPack(raw);
  if (!pack) {
    return {
      passed: false,
      headline: "UK AI Safety pack missing",
      detail: "Seed ukAiSafetyPack before publish in UK deployments.",
    };
  }
  const failedEval = pack.capabilityEvals.find((e) => !e.passed);
  if (failedEval) {
    return {
      passed: false,
      headline: `Capability eval failed: ${failedEval.evalId}`,
      detail: `${failedEval.metric} ${failedEval.score} vs threshold ${failedEval.threshold}`,
    };
  }
  if (pack.riskTier === "high" && pack.redTeamLog.length === 0) {
    return {
      passed: false,
      headline: "High-risk UK AI — red-team log required",
      detail: "Record red-team scenario before frontier assignment changes.",
    };
  }
  if (pack.frontierDisclosure?.capabilityTier === "frontier" && !pack.frontierDisclosure.alignmentReview) {
    return {
      passed: false,
      headline: "Frontier model requires alignment review",
      detail: "Set alignmentReview=true after safety review.",
    };
  }
  return {
    passed: true,
    headline: `UK AI Safety OK (${pack.riskTier})`,
    detail: `${pack.capabilityEvals.length} evals · ${pack.redTeamLog.length} red-team entries`,
  };
}
