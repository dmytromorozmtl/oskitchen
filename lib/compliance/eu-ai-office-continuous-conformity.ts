/**
 * AA4 — EU AI Office continuous conformity: real-time Article 43 delta sync (Z4 + S4).
 */

import { createHash } from "node:crypto";
import { isEuAiActPackEnabled, readEuAiActPack } from "@/lib/compliance/eu-ai-act";
import {
  isEuAiOfficeNotifiedBodyEnabled,
  readEuAiOfficeNotifiedBodyPack,
} from "@/lib/compliance/eu-ai-office-notified-body";

export type ConformityDelta = {
  at: string;
  deltaId: string;
  article: "Article-43";
  previousStatus: string | null;
  newStatus: string;
  deltaHash: string;
  certBodyCrossRef: string | null;
  syncedToEuDatabase: boolean;
};

export type EuAiOfficeContinuousConformityPack = {
  at: string;
  deltas: ConformityDelta[];
  lastDeltaAt: string | null;
  continuousConformityReady: boolean;
  syncLagMs: number;
};

export function isEuAiOfficeContinuousConformityEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_EU_AI_OFFICE_CONTINUOUS_CONFORMITY === "1";
}

export function conformityDeltaMaxAgeMs(): number {
  return Number(process.env.THEME_EXPERIMENT_EU_AI_OFFICE_DELTA_MAX_AGE_MS ?? "86400000");
}

export function readEuAiOfficeContinuousConformity(
  raw: unknown,
): EuAiOfficeContinuousConformityPack | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).euAiOfficeContinuousConformity;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  return o as EuAiOfficeContinuousConformityPack;
}

export function mergeEuAiOfficeContinuousConformity(
  previousRaw: unknown,
  pack: EuAiOfficeContinuousConformityPack,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.euAiOfficeContinuousConformity = pack;
  return base;
}

function hashConformityDelta(input: {
  previousStatus: string | null;
  newStatus: string;
  certBodyCrossRef: string | null;
}): string {
  return createHash("sha256")
    .update(`eu-a43-delta:${input.previousStatus}:${input.newStatus}:${input.certBodyCrossRef}`)
    .digest("hex");
}

export function recordConformityDelta(
  previousRaw: unknown,
  delta: Omit<ConformityDelta, "at" | "deltaId" | "deltaHash" | "article"> & {
    deltaId?: string;
    at?: string;
  },
): { json: Record<string, unknown>; pack: EuAiOfficeContinuousConformityPack } {
  const prev = readEuAiOfficeContinuousConformity(previousRaw);
  const at = delta.at ?? new Date().toISOString();
  const entry: ConformityDelta = {
    at,
    deltaId: delta.deltaId ?? `eu-delta-${Date.now()}`,
    article: "Article-43",
    previousStatus: delta.previousStatus,
    newStatus: delta.newStatus,
    deltaHash: hashConformityDelta(delta),
    certBodyCrossRef: delta.certBodyCrossRef,
    syncedToEuDatabase: delta.syncedToEuDatabase,
  };

  const deltas = [...(prev?.deltas ?? []), entry].slice(-100);
  const last = deltas[deltas.length - 1] ?? null;
  const syncLagMs = last ? Date.now() - new Date(last.at).getTime() : Infinity;
  const continuousConformityReady =
    last !== null &&
    syncLagMs <= conformityDeltaMaxAgeMs() &&
    (last.newStatus === "conformity" || last.newStatus === "conditional") &&
    last.syncedToEuDatabase;

  const pack: EuAiOfficeContinuousConformityPack = {
    at: new Date().toISOString(),
    deltas,
    lastDeltaAt: last?.at ?? null,
    continuousConformityReady,
    syncLagMs: Number.isFinite(syncLagMs) ? syncLagMs : 0,
  };

  return { json: mergeEuAiOfficeContinuousConformity(previousRaw, pack), pack };
}

export function syncConformityDeltaFromNotifiedBody(raw: unknown): {
  json: Record<string, unknown>;
  pack: EuAiOfficeContinuousConformityPack | null;
} {
  const nb = readEuAiOfficeNotifiedBodyPack(raw);
  if (!nb?.assessments.length) {
    return { json: raw as Record<string, unknown>, pack: null };
  }
  const latest = nb.assessments[nb.assessments.length - 1]!;
  const prev = readEuAiOfficeContinuousConformity(raw);
  const previousStatus = prev?.deltas[prev.deltas.length - 1]?.newStatus ?? null;
  if (previousStatus === latest.conformityStatus && prev?.continuousConformityReady) {
    return { json: raw as Record<string, unknown>, pack: prev };
  }
  const { json, pack } = recordConformityDelta(raw, {
    previousStatus,
    newStatus: latest.conformityStatus,
    certBodyCrossRef: latest.certBodyCrossRef,
    syncedToEuDatabase: true,
  });
  return { json, pack };
}

export function evaluateEuAiOfficeContinuousConformityGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isEuAiOfficeContinuousConformityEnabled()) {
    return { passed: true, headline: "EU continuous conformity off", detail: "" };
  }
  if (!isEuAiOfficeNotifiedBodyEnabled()) {
    return {
      passed: false,
      headline: "EU AI Office notified body required",
      detail: "Enable THEME_EXPERIMENT_EU_AI_OFFICE_NOTIFIED_BODY=1 (Z4).",
    };
  }
  if (!isEuAiActPackEnabled()) {
    return {
      passed: false,
      headline: "EU AI Act pack required",
      detail: "Enable THEME_EXPERIMENT_EU_AI_ACT=1 (S4).",
    };
  }
  const nb = readEuAiOfficeNotifiedBodyPack(raw);
  if (!nb?.notifiedBodyReady) {
    return {
      passed: false,
      headline: "Z4 notified body not ready for continuous sync",
      detail: "Complete Article 43 baseline assessment first.",
    };
  }
  const pack = readEuAiOfficeContinuousConformity(raw);
  if (!pack || pack.deltas.length === 0) {
    return {
      passed: false,
      headline: "Article 43 conformity delta missing",
      detail: "Run eu-ai-office-continuous-conformity-sync cron.",
    };
  }
  if (!pack.continuousConformityReady) {
    const ageH = pack.lastDeltaAt
      ? Math.round((Date.now() - new Date(pack.lastDeltaAt).getTime()) / 3600000)
      : null;
    return {
      passed: false,
      headline: "Continuous conformity stale",
      detail: ageH !== null ? `Last delta ${ageH}h ago (max ${conformityDeltaMaxAgeMs() / 3600000}h).` : "No recent delta.",
    };
  }
  const eu = readEuAiActPack(raw);
  return {
    passed: true,
    headline: "EU AI Office continuous conformity aligned",
    detail: `Lag ${pack.syncLagMs}ms · risk ${eu?.modelCard.riskTier ?? "—"} · ${pack.deltas.length} deltas`,
  };
}
