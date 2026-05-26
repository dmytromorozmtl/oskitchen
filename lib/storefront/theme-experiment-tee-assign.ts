/**
 * V1 — Confidential computing (TEE) attested enclave assignment (SGX/SEV-sim).
 * Pairs with U1 ZK fairness + S1 quantum-safe hybrid bucket.
 */

import { createHash } from "node:crypto";
import {
  hybridAssignmentBucket,
  isQuantumSafeAssignmentEnabled,
  sealVisitorWithMlKem,
} from "@/lib/storefront/theme-experiment-quantum-safe";

export { isQuantumSafeAssignmentEnabled };
import { stableBucketPercent } from "@/lib/storefront/theme-experiment-bucket";
import { commitVisitorId } from "@/lib/storefront/theme-experiment-zk-assignment-fairness";

export type TeeEnclaveType = "intel-sgx" | "amd-sev";

export type TeeAttestationQuote = {
  at: string;
  enclaveType: TeeEnclaveType;
  /** Simulated attestation report hash (MR_ENCLAVE / measurement). */
  measurementHash: string;
  visitorCommitment: string;
  armId: string;
  bucket: number;
  verified: boolean;
  expiresAt: string;
};

export type TeeAssignmentSnapshot = {
  at: string;
  quotes: TeeAttestationQuote[];
  attestationPassRate: number;
  requireAttestationForPublish: boolean;
};

export function isTeeAssignEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_TEE_ASSIGN === "1";
}

export function teeEnclaveType(): TeeEnclaveType {
  const t = process.env.THEME_EXPERIMENT_TEE_ENCLAVE?.trim();
  return t === "amd-sev" ? "amd-sev" : "intel-sgx";
}

export function teeAttestationTtlHours(): number {
  return Number(process.env.THEME_EXPERIMENT_TEE_ATTESTATION_TTL_H ?? "24");
}

/** Simulate enclave attestation + assign inside TEE boundary. */
export function attestAndAssignInEnclave(input: {
  visitorId: string;
  armId: string;
  useQuantumHybrid?: boolean;
}): TeeAttestationQuote {
  const visitorCommitment = commitVisitorId(input.visitorId);
  const bucket = input.useQuantumHybrid
    ? hybridAssignmentBucket(input.visitorId)
    : stableBucketPercent(input.visitorId);
  const { kemCiphertextHash } = sealVisitorWithMlKem(input.visitorId);
  const enclave = teeEnclaveType();
  const measurementHash = createHash("sha256")
    .update(`tee:${enclave}:${visitorCommitment}:${bucket}:${kemCiphertextHash}`)
    .digest("hex");

  const ttlMs = teeAttestationTtlHours() * 3600 * 1000;
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();

  const quote: TeeAttestationQuote = {
    at: new Date().toISOString(),
    enclaveType: enclave,
    measurementHash,
    visitorCommitment,
    armId: input.armId,
    bucket,
    verified: false,
    expiresAt,
  };
  quote.verified = verifyTeeAttestationQuote(quote);
  return quote;
}

export function verifyTeeAttestationQuote(quote: TeeAttestationQuote): boolean {
  if (new Date(quote.expiresAt).getTime() < Date.now()) return false;
  return quote.measurementHash.length === 64 && quote.visitorCommitment.length >= 16 && Boolean(quote.armId);
}

export function readTeeAssignmentSnapshot(raw: unknown): TeeAssignmentSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).teeAssignment;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    quotes: Array.isArray(s.quotes) ? (s.quotes as TeeAttestationQuote[]) : [],
    attestationPassRate: typeof s.attestationPassRate === "number" ? s.attestationPassRate : 0,
    requireAttestationForPublish: s.requireAttestationForPublish !== false,
  };
}

export function recordTeeAttestationQuote(
  raw: unknown,
  quote: TeeAttestationQuote,
): Record<string, unknown> {
  const prev = readTeeAssignmentSnapshot(raw) ?? {
    at: new Date().toISOString(),
    quotes: [],
    attestationPassRate: 0,
    requireAttestationForPublish: true,
  };
  const quotes = [...prev.quotes.filter((q) => q.visitorCommitment !== quote.visitorCommitment), quote].slice(
    -400,
  );
  const verified = quotes.filter((q) => verifyTeeAttestationQuote(q)).length;
  const snap: TeeAssignmentSnapshot = {
    ...prev,
    at: new Date().toISOString(),
    quotes,
    attestationPassRate: quotes.length > 0 ? verified / quotes.length : 0,
  };
  const base =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};
  base.teeAssignment = snap;
  return base;
}

export function evaluateTeeAttestationPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isTeeAssignEnabled()) {
    return { passed: true, headline: "TEE assign off", detail: "" };
  }
  const snap = readTeeAssignmentSnapshot(raw);
  if (!snap?.requireAttestationForPublish) {
    return { passed: true, headline: "TEE attest optional", detail: "" };
  }
  if (!snap || snap.quotes.length === 0) {
    return {
      passed: false,
      headline: "TEE attestation required",
      detail: "No enclave quotes — assignment must run inside attested TEE.",
    };
  }
  if (snap.attestationPassRate < 0.99) {
    return {
      passed: false,
      headline: `TEE attestation rate ${Math.round(snap.attestationPassRate * 100)}%`,
      detail: `${teeEnclaveType()} quotes expired or invalid.`,
    };
  }
  return {
    passed: true,
    headline: `TEE OK (${snap.quotes.length} quotes)`,
    detail: `${teeEnclaveType()} · pass rate ${Math.round(snap.attestationPassRate * 100)}%`,
  };
}
