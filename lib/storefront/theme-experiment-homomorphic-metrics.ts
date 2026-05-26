/**
 * T1 — Homomorphic encrypted arm metrics (CKKS-like simulated layer on audit stream).
 * Aggregates conversion/checkout counts without decrypting per-visitor payloads at edge.
 */

import { createHash } from "node:crypto";
import {
  encodeHomomorphicInteger,
  homomorphicAdd as backendHomomorphicAdd,
  homomorphicCiphertextHash,
  homomorphicScheme,
} from "@/lib/experiment-production/homomorphic-seal-backend";

export type HomomorphicArmCiphertext = {
  armId: string;
  /** Simulated CKKS ciphertext fingerprint (no raw metrics). */
  ciphertextHash: string;
  encryptedConversions: string;
  encryptedCheckouts: string;
  noiseScale: number;
  sampleCount: number;
};

export type HomomorphicMetricsSnapshot = {
  at: string;
  arms: HomomorphicArmCiphertext[];
  aggregatedLiftPp: number;
  noiseBudgetRemaining: number;
  aggregationComplete: boolean;
  scheme: "CKKS-sim" | "CKKS-seal";
};

export function isHomomorphicMetricsEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HOMOMORPHIC_METRICS === "1";
}

export function homomorphicNoiseBudget(): number {
  return Number(process.env.THEME_EXPERIMENT_HOMOMORPHIC_NOISE_BUDGET ?? "100");
}

/** Simulated CKKS encode: scale integers into noisy lattice representation. */
export function ckksEncodeInteger(value: number, noiseScale: number): string {
  const noise = Math.round((Math.random() - 0.5) * noiseScale * 2);
  const scaled = BigInt(value) * BigInt(1000) + BigInt(noise);
  return scaled.toString(36);
}

/** Homomorphic add — delegates to sim or SEAL backend. */
export function ckksHomomorphicAdd(a: string, b: string): string {
  return backendHomomorphicAdd(a, b);
}

export function encryptArmMetricsCell(input: {
  armId: string;
  conversions: number;
  checkouts: number;
  visitorSealHash?: string;
}): HomomorphicArmCiphertext {
  const noiseScale = Number(process.env.THEME_EXPERIMENT_HOMOMORPHIC_NOISE_SCALE ?? "8");
  const material = `${input.armId}:${input.conversions}:${input.checkouts}:${input.visitorSealHash ?? ""}`;
  return {
    armId: input.armId,
    ciphertextHash: homomorphicCiphertextHash(material),
    encryptedConversions: encodeHomomorphicInteger(input.conversions, noiseScale, input.armId),
    encryptedCheckouts: encodeHomomorphicInteger(input.checkouts, noiseScale, `${input.armId}:co`),
    noiseScale,
    sampleCount: input.checkouts,
  };
}

export function readHomomorphicMetrics(raw: unknown): HomomorphicMetricsSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).homomorphicMetrics;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    arms: Array.isArray(s.arms) ? (s.arms as HomomorphicArmCiphertext[]) : [],
    aggregatedLiftPp: typeof s.aggregatedLiftPp === "number" ? s.aggregatedLiftPp : 0,
    noiseBudgetRemaining: typeof s.noiseBudgetRemaining === "number" ? s.noiseBudgetRemaining : homomorphicNoiseBudget(),
    aggregationComplete: s.aggregationComplete === true,
    scheme: s.scheme === "CKKS-seal" ? "CKKS-seal" : "CKKS-sim",
  };
}

export function mergeHomomorphicMetrics(
  previousRaw: unknown,
  snap: HomomorphicMetricsSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.homomorphicMetrics = snap;
  return base;
}

/** Aggregate encrypted arm cells without decrypting visitor-level payloads. */
export function aggregateHomomorphicArmCells(
  cells: HomomorphicArmCiphertext[],
  previousBudget: number,
): HomomorphicMetricsSnapshot {
  const byArm = new Map<string, HomomorphicArmCiphertext>();
  let budgetSpent = 0;

  for (const c of cells) {
    budgetSpent += c.noiseScale;
    const prev = byArm.get(c.armId);
    if (!prev) {
      byArm.set(c.armId, { ...c });
      continue;
    }
    byArm.set(c.armId, {
      ...prev,
      encryptedConversions: ckksHomomorphicAdd(prev.encryptedConversions, c.encryptedConversions),
      encryptedCheckouts: ckksHomomorphicAdd(prev.encryptedCheckouts, c.encryptedCheckouts),
      sampleCount: prev.sampleCount + c.sampleCount,
      ciphertextHash: createHash("sha3-256")
        .update(`${prev.ciphertextHash}:${c.ciphertextHash}`)
        .digest("hex")
        .slice(0, 48),
    });
  }

  const arms = [...byArm.values()];
  const draft = arms.find((a) => a.armId === "draft");
  const published = arms.find((a) => a.armId === "published");
  let aggregatedLiftPp = 0;
  if (draft && published && published.sampleCount > 0 && draft.sampleCount > 0) {
    const pubRate = published.sampleCount > 0 ? published.sampleCount / published.sampleCount : 0;
    const draftEnc = parseInt(draft.encryptedCheckouts, 36) || 0;
    const pubEnc = parseInt(published.encryptedCheckouts, 36) || 1;
    aggregatedLiftPp = Math.round(((draftEnc - pubEnc) / Math.max(1, pubEnc)) * 1000) / 10;
  }

  const noiseBudgetRemaining = Math.max(0, previousBudget - budgetSpent);

  return {
    at: new Date().toISOString(),
    arms,
    aggregatedLiftPp,
    noiseBudgetRemaining,
    aggregationComplete: arms.length >= 2 && noiseBudgetRemaining > 0,
    scheme: homomorphicScheme(),
  };
}

export function ingestHomomorphicArmBatch(
  raw: unknown,
  cells: HomomorphicArmCiphertext[],
): HomomorphicMetricsSnapshot {
  const prev = readHomomorphicMetrics(raw);
  const budget = prev?.noiseBudgetRemaining ?? homomorphicNoiseBudget();
  const snap = aggregateHomomorphicArmCells(cells, budget);
  return snap;
}

export function evaluateHomomorphicMetricsPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHomomorphicMetricsEnabled()) {
    return { passed: true, headline: "Homomorphic metrics off", detail: "" };
  }
  const snap = readHomomorphicMetrics(raw);
  if (!snap) {
    return {
      passed: true,
      headline: "Awaiting homomorphic batch",
      detail: "CKKS aggregation runs after audit stream ingest.",
    };
  }
  if (snap.noiseBudgetRemaining <= 0) {
    return {
      passed: false,
      headline: "Homomorphic noise budget exhausted",
      detail: "Re-key CKKS context or wait for next aggregation window.",
    };
  }
  if (!snap.aggregationComplete) {
    return {
      passed: false,
      headline: "Homomorphic aggregation incomplete",
      detail: `Need ≥2 arms with remaining budget (have ${snap.arms.length}).`,
    };
  }
  return {
    passed: true,
    headline: `Homomorphic OK (lift ~${snap.aggregatedLiftPp}pp)`,
    detail: `${snap.arms.length} arms · budget ${snap.noiseBudgetRemaining} · ${snap.scheme}`,
  };
}
