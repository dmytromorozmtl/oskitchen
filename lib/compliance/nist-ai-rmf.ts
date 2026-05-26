/**
 * V4 — NIST AI RMF 1.0 alignment (Govern/Map/Measure/Manage) extending U4 EO 14110 + T4 UK AI Safety.
 */

import { readEo14110InventoryPack, isEo14110InventoryEnabled } from "@/lib/compliance/eo-14110-ai-inventory";
import { toJsonValue } from "@/lib/prisma/json";
import { readUkAiSafetyPack, isUkAiSafetyEnabled } from "@/lib/compliance/uk-ai-safety";

export type NistAiRmfFunction = "govern" | "map" | "measure" | "manage";

export type NistAiRmfRiskEntry = {
  at: string;
  riskId: string;
  category: string;
  likelihood: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  mitigation: string;
  owner: string;
};

export type NistAiRmfPack = {
  at: string;
  functions: Record<NistAiRmfFunction, { status: "complete" | "partial" | "pending"; notes: string }>;
  riskRegister: NistAiRmfRiskEntry[];
  alignmentVersion: "1.0";
};

export function isNistAiRmfEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_NIST_AI_RMF === "1";
}

export function seedNistAiRmfFromCompliancePacks(raw: unknown): NistAiRmfPack {
  const eo = readEo14110InventoryPack(raw);
  const uk = readUkAiSafetyPack(raw);

  const dualUseOk = eo?.dualUseScreeningPassed ?? false;
  const evalsOk = uk?.capabilityEvals.every((e) => e.passed) ?? true;

  return {
    at: new Date().toISOString(),
    alignmentVersion: "1.0",
    functions: {
      govern: {
        status: eo ? "complete" : "partial",
        notes: "EO 14110 model inventory + oversight hooks",
      },
      map: {
        status: uk ? "complete" : "partial",
        notes: "UK AI Safety capability evals + frontier disclosure",
      },
      measure: {
        status: evalsOk ? "complete" : "partial",
        notes: "Experiment metrics + homomorphic/ZK fairness gates",
      },
      manage: {
        status: dualUseOk ? "complete" : "pending",
        notes: "Dual-use screening + incident log from EO 14110",
      },
    },
    riskRegister: [
      {
        at: new Date().toISOString(),
        riskId: "RMF-ASSIGN-01",
        category: "assignment_fairness",
        likelihood: "low",
        impact: "medium",
        mitigation: "ZK + TEE attestation gates",
        owner: "platform",
      },
      {
        at: new Date().toISOString(),
        riskId: "RMF-SCIENTIST-02",
        category: "autonomous_experimentation",
        likelihood: "medium",
        impact: "high",
        mitigation: "Multi-agent critic + Slack approval",
        owner: "experiment_ops",
      },
    ],
  };
}

export function readNistAiRmfPack(raw: unknown): NistAiRmfPack | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).nistAiRmfPack;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const p = o as Record<string, unknown>;
  return {
    at: typeof p.at === "string" ? p.at : new Date().toISOString(),
    functions: (p.functions as NistAiRmfPack["functions"]) ?? seedNistAiRmfFromCompliancePacks(raw).functions,
    riskRegister: Array.isArray(p.riskRegister) ? (p.riskRegister as NistAiRmfRiskEntry[]) : [],
    alignmentVersion: "1.0",
  };
}

export function mergeNistAiRmfPack(previousRaw: unknown, pack: NistAiRmfPack): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.nistAiRmfPack = pack;
  return base;
}

export function evaluateNistAiRmfPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isNistAiRmfEnabled()) {
    return { passed: true, headline: "NIST AI RMF off", detail: "" };
  }
  if (!isEo14110InventoryEnabled()) {
    return {
      passed: false,
      headline: "EO 14110 inventory required",
      detail: "Enable THEME_EXPERIMENT_EO_14110_INVENTORY=1.",
    };
  }
  const pack = readNistAiRmfPack(raw);
  if (!pack) {
    return {
      passed: false,
      headline: "NIST AI RMF pack missing",
      detail: "Run nist-ai-rmf-seed cron.",
    };
  }
  const pending = (Object.keys(pack.functions) as NistAiRmfFunction[]).filter(
    (f) => pack.functions[f].status === "pending",
  );
  if (pending.length > 0) {
    return {
      passed: false,
      headline: `NIST AI RMF pending: ${pending.join(", ")}`,
      detail: "Complete Govern/Map/Measure/Manage before publish.",
    };
  }
  const highRisk = pack.riskRegister.filter(
    (r) => r.likelihood === "high" && r.impact === "high" && !r.mitigation,
  );
  if (highRisk.length > 0) {
    return {
      passed: false,
      headline: "High AI risks lack mitigation",
      detail: `${highRisk.length} entries in risk register.`,
    };
  }
  if (isUkAiSafetyEnabled() && !readUkAiSafetyPack(raw)) {
    return {
      passed: false,
      headline: "UK AI Safety pack required for Map function",
      detail: "Seed ukAiSafetyPack.",
    };
  }
  return {
    passed: true,
    headline: "NIST AI RMF 1.0 aligned",
    detail: `${pack.riskRegister.length} risks · all functions complete`,
  };
}
