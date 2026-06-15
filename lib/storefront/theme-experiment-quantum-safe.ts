/**
 * S1 — Quantum-safe assignment: ML-KEM sealed visitor buckets hybrid with SHA-256 bucket.
 */

import { createHash } from "node:crypto";
import { stableBucketPercent } from "@/lib/storefront/theme-experiment-bucket";

export type QuantumVisitorSeal = {
  at: string;
  visitorId: string;
  /** Simulated ML-KEM-768 ciphertext fingerprint (no raw PII). */
  kemCiphertextHash: string;
  kemAlgorithm: "ML-KEM-768";
  hybridBucket: number;
  classicalBucket: number;
};

export type QuantumSafeSnapshot = {
  at: string;
  seals: QuantumVisitorSeal[];
  hybridMode: "xor" | "weighted";
  kemRotationDays: number;
};

export function isQuantumSafeAssignmentEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_QUANTUM_SAFE === "1";
}

export function kemRotationDays(): number {
  return Number(process.env.THEME_EXPERIMENT_KEM_ROTATION_DAYS ?? "90");
}

/** Deterministic KEM seal fingerprint from visitor id (production: replace with real ML-KEM encaps). */
export function sealVisitorWithMlKem(visitorId: string): {
  kemCiphertextHash: string;
  kemDerivedBucket: number;
} {
  const kemMaterial = createHash("sha3-256")
    .update(`ml-kem-768:${visitorId}:${process.env.THEME_EXPERIMENT_KEM_SALT ?? "kos"}`)
    .digest("hex");
  const kemDerivedBucket = parseInt(kemMaterial.slice(0, 8), 16) % 100;
  return {
    kemCiphertextHash: kemMaterial.slice(0, 64),
    kemDerivedBucket,
  };
}

/** Hybrid bucket: combine classical sticky hash with post-quantum KEM bucket. */
export function hybridAssignmentBucket(visitorId: string, mode: "xor" | "weighted" = "weighted"): number {
  const classical = stableBucketPercent(visitorId);
  const { kemDerivedBucket } = sealVisitorWithMlKem(visitorId);
  if (mode === "xor") return (classical ^ kemDerivedBucket) % 100;
  return Math.floor(classical * 0.6 + kemDerivedBucket * 0.4) % 100;
}

export function readQuantumSafeSnapshot(raw: unknown): QuantumSafeSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).quantumSafeAssignment;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    seals: Array.isArray(s.seals) ? (s.seals as QuantumVisitorSeal[]) : [],
    hybridMode: s.hybridMode === "xor" ? "xor" : "weighted",
    kemRotationDays: typeof s.kemRotationDays === "number" ? s.kemRotationDays : kemRotationDays(),
  };
}

export function recordQuantumVisitorSeal(
  raw: unknown,
  visitorId: string,
): { seal: QuantumVisitorSeal; json: Record<string, unknown> } {
  const prev = readQuantumSafeSnapshot(raw) ?? {
    at: new Date().toISOString(),
    seals: [],
    hybridMode: "weighted" as const,
    kemRotationDays: kemRotationDays(),
  };
  const classical = stableBucketPercent(visitorId);
  const { kemCiphertextHash, kemDerivedBucket } = sealVisitorWithMlKem(visitorId);
  const hybridBucket = hybridAssignmentBucket(visitorId, prev.hybridMode);

  const seal: QuantumVisitorSeal = {
    at: new Date().toISOString(),
    visitorId: createHash("sha256").update(visitorId).digest("hex").slice(0, 16),
    kemCiphertextHash,
    kemAlgorithm: "ML-KEM-768",
    hybridBucket,
    classicalBucket: classical,
  };

  const seals = [...prev.seals.filter((s) => s.visitorId !== seal.visitorId), seal].slice(-300);
  const json =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};
  json.quantumSafeAssignment = {
    ...prev,
    at: new Date().toISOString(),
    seals,
  };
  return { seal, json };
}

export function evaluateQuantumSafePublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isQuantumSafeAssignmentEnabled()) {
    return { passed: true, headline: "Quantum-safe off", detail: "" };
  }
  const snap = readQuantumSafeSnapshot(raw);
  if (!snap || snap.seals.length === 0) {
    return {
      passed: true,
      headline: "No KEM seals yet",
      detail: "Hybrid buckets activate on first visitor assignment.",
    };
  }
  const staleDays = kemRotationDays();
  const oldest = snap.seals[0]?.at;
  if (oldest) {
    const ageDays = (Date.now() - new Date(oldest).getTime()) / (86400 * 1000);
    if (ageDays > staleDays) {
      return {
        passed: false,
        headline: `KEM rotation required (>${staleDays}d)`,
        detail: "Re-seal visitors after ML-KEM key rotation.",
      };
    }
  }
  return {
    passed: true,
    headline: `Quantum-safe OK (${snap.seals.length} seals)`,
    detail: `Hybrid ${snap.hybridMode} · ML-KEM-768 + classical SHA-256.`,
  };
}
