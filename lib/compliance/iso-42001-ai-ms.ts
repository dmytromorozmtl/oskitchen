/**
 * W4 — ISO/IEC 42001 AI management system attestation (extends V4 NIST AI RMF + S4 EU AI Act).
 */

import { readEuAiActPack, isEuAiActPackEnabled } from "@/lib/compliance/eu-ai-act";
import { toJsonValue } from "@/lib/prisma/json";
import { readNistAiRmfPack, isNistAiRmfEnabled } from "@/lib/compliance/nist-ai-rmf";

export type Iso42001Clause =
  | "4-context"
  | "5-leadership"
  | "6-planning"
  | "7-support"
  | "8-operation"
  | "9-evaluation"
  | "10-improvement";

export type Iso42001AiMsPack = {
  at: string;
  certificationTarget: "ISO/IEC 42001:2023";
  clauses: Record<Iso42001Clause, { status: "conformant" | "partial" | "gap"; evidence: string }>;
  aiPolicyUrl: string | null;
  managementReviewAt: string | null;
};

export function isIso42001AiMsEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_ISO_42001 === "1";
}

export function seedIso42001FromRmfAndEu(raw: unknown): Iso42001AiMsPack {
  const rmf = readNistAiRmfPack(raw);
  const eu = readEuAiActPack(raw);

  const governOk = rmf?.functions.govern.status === "complete";
  const mapOk = rmf?.functions.map.status === "complete";
  const measureOk = rmf?.functions.measure.status === "complete";
  const manageOk = rmf?.functions.manage.status === "complete";

  return {
    at: new Date().toISOString(),
    certificationTarget: "ISO/IEC 42001:2023",
    clauses: {
      "4-context": {
        status: eu ? "conformant" : "partial",
        evidence: "EU AI Act model card + risk tier",
      },
      "5-leadership": {
        status: governOk ? "conformant" : "partial",
        evidence: "NIST RMF Govern + EO 14110 inventory",
      },
      "6-planning": {
        status: mapOk ? "conformant" : "partial",
        evidence: "NIST RMF Map + UK capability evals",
      },
      "7-support": {
        status: eu?.oversightLog.length ? "conformant" : "partial",
        evidence: "Human oversight log + resources",
      },
      "8-operation": {
        status: measureOk ? "conformant" : "partial",
        evidence: "Experiment assignment controls + metrics",
      },
      "9-evaluation": {
        status: measureOk && manageOk ? "conformant" : "partial",
        evidence: "NIST RMF Measure/Manage + monitoring",
      },
      "10-improvement": {
        status: manageOk ? "conformant" : "gap",
        evidence: "Incident log + scientist guardrails",
      },
    },
    aiPolicyUrl: process.env.ISO_42001_AI_POLICY_URL ?? eu?.transparencyUrl ?? null,
    managementReviewAt: new Date().toISOString(),
  };
}

export function readIso42001AiMsPack(raw: unknown): Iso42001AiMsPack | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).iso42001AiMsPack;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  return o as Iso42001AiMsPack;
}

export function mergeIso42001AiMsPack(previousRaw: unknown, pack: Iso42001AiMsPack): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.iso42001AiMsPack = pack;
  return base;
}

export function evaluateIso42001AiMsPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isIso42001AiMsEnabled()) {
    return { passed: true, headline: "ISO 42001 AI MS off", detail: "" };
  }
  if (!isNistAiRmfEnabled()) {
    return {
      passed: false,
      headline: "NIST AI RMF required for ISO 42001",
      detail: "Enable THEME_EXPERIMENT_NIST_AI_RMF=1.",
    };
  }
  if (!isEuAiActPackEnabled()) {
    return {
      passed: false,
      headline: "EU AI Act required for ISO 42001",
      detail: "Enable THEME_EXPERIMENT_EU_AI_ACT=1.",
    };
  }
  const pack = readIso42001AiMsPack(raw);
  if (!pack) {
    return {
      passed: false,
      headline: "ISO 42001 pack missing",
      detail: "Run iso-42001-ai-ms-seed cron.",
    };
  }
  const gaps = (Object.keys(pack.clauses) as Iso42001Clause[]).filter(
    (c) => pack.clauses[c].status === "gap",
  );
  if (gaps.length > 0) {
    return {
      passed: false,
      headline: `ISO 42001 gaps: ${gaps.join(", ")}`,
      detail: "Close AI MS clauses before publish in certified regions.",
    };
  }
  const partial = (Object.keys(pack.clauses) as Iso42001Clause[]).filter(
    (c) => pack.clauses[c].status === "partial",
  );
  if (partial.length > 2) {
    return {
      passed: false,
      headline: `ISO 42001 partial (${partial.length} clauses)`,
      detail: "Too many partial clauses for conformant attestation.",
    };
  }
  return {
    passed: true,
    headline: "ISO/IEC 42001 AI MS aligned",
    detail: `${pack.certificationTarget} · management review ${pack.managementReviewAt?.slice(0, 10) ?? "n/a"}`,
  };
}
