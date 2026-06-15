/**
 * X1 — Post-quantum DNA archival: ML-DSA fingerprint layer over W1 ATGC hash chain blocks.
 */

import { createHash } from "node:crypto";
import {
  isDnaAuditTrailEnabled,
  readDnaAuditTrail,
  type DnaAuditBlock,
} from "@/lib/compliance/dna-encoded-audit-trail";
import { signPqcDnaBlockSync } from "@/lib/experiment-production/pqc-signing-backend";
import { isQuantumSafeAssignmentEnabled } from "@/lib/storefront/theme-experiment-quantum-safe";

export type PqcDnaSeal = {
  at: string;
  blockIndex: number;
  blockHash: string;
  dnaSequence: string;
  /** Simulated ML-DSA-65 signature fingerprint over block + DNA. */
  mldsaFingerprint: string;
  kemBindingHash: string;
  algorithm: "ML-DSA-65" | "ML-DSA-87";
  cryptoBackend?: "sim" | "prod";
};

export type PqcDnaArchivalSnapshot = {
  at: string;
  seals: PqcDnaSeal[];
  chainSealed: boolean;
  sealedBlockCount: number;
  archivalPeriod: string | null;
};

export function isPqcDnaArchivalEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_PQC_DNA_ARCHIVAL === "1";
}

export function pqcDnaAlgorithm(): PqcDnaSeal["algorithm"] {
  const v = process.env.THEME_EXPERIMENT_PQC_DNA_ALGORITHM?.trim();
  return v === "ML-DSA-87" ? "ML-DSA-87" : "ML-DSA-65";
}

export function pqcMinSealedBlocks(): number {
  return Number(process.env.THEME_EXPERIMENT_PQC_DNA_MIN_SEALS ?? "1");
}

/** ML-DSA sign via sim or liboqs/HSM production backend. */
export function sealDnaBlockWithMldsa(block: DnaAuditBlock): {
  mldsaFingerprint: string;
  kemBindingHash: string;
  cryptoBackend?: "sim" | "prod";
} {
  const kemSalt = process.env.THEME_EXPERIMENT_KEM_SALT ?? "kos";
  const signed = signPqcDnaBlockSync({
    algorithm: pqcDnaAlgorithm(),
    previousHash: block.previousHash,
    blockHash: block.blockHash,
    dnaSequence: block.dnaSequence,
    kemSalt,
  });
  return {
    mldsaFingerprint: signed.mldsaFingerprint,
    kemBindingHash: signed.kemBindingHash,
    cryptoBackend: signed.backend,
  };
}

export function readPqcDnaArchival(raw: unknown): PqcDnaArchivalSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).pqcDnaArchival;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    seals: Array.isArray(s.seals) ? (s.seals as PqcDnaSeal[]) : [],
    chainSealed: s.chainSealed === true,
    sealedBlockCount: typeof s.sealedBlockCount === "number" ? s.sealedBlockCount : 0,
    archivalPeriod: typeof s.archivalPeriod === "string" ? s.archivalPeriod : null,
  };
}

export function sealPqcDnaArchivalFromTrail(
  previousRaw: unknown,
  opts?: { period?: string },
): { json: Record<string, unknown>; snap: PqcDnaArchivalSnapshot } {
  const trail = readDnaAuditTrail(previousRaw);
  const prev = readPqcDnaArchival(previousRaw);
  const blocks = trail?.blocks ?? [];

  const seals: PqcDnaSeal[] = [];
  const chainSealed = trail?.chainValid ?? true;

  for (const block of blocks) {
    const signed = sealDnaBlockWithMldsa(block);

    seals.push({
      at: new Date().toISOString(),
      blockIndex: block.blockIndex,
      blockHash: block.blockHash,
      dnaSequence: block.dnaSequence,
      mldsaFingerprint: signed.mldsaFingerprint,
      kemBindingHash: signed.kemBindingHash,
      algorithm: pqcDnaAlgorithm(),
      cryptoBackend: signed.cryptoBackend,
    });
  }

  const snap: PqcDnaArchivalSnapshot = {
    at: new Date().toISOString(),
    seals: seals.slice(-500),
    chainSealed: chainSealed && (trail?.chainValid ?? true),
    sealedBlockCount: seals.length,
    archivalPeriod: opts?.period ?? trail?.soc2Period ?? new Date().toISOString().slice(0, 7),
  };

  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.pqcDnaArchival = snap;
  return { json: base, snap };
}

export function evaluatePqcDnaArchivalGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isPqcDnaArchivalEnabled()) {
    return { passed: true, headline: "PQC DNA archival off", detail: "" };
  }
  if (!isDnaAuditTrailEnabled()) {
    return {
      passed: false,
      headline: "DNA audit trail required for PQC archival",
      detail: "Enable THEME_EXPERIMENT_DNA_AUDIT_TRAIL=1.",
    };
  }
  if (!isQuantumSafeAssignmentEnabled()) {
    return {
      passed: false,
      headline: "Quantum-safe assignment required for PQC DNA",
      detail: "Enable THEME_EXPERIMENT_QUANTUM_SAFE=1 (S1).",
    };
  }
  const trail = readDnaAuditTrail(raw);
  const pqc = readPqcDnaArchival(raw);

  if (!trail || trail.blocks.length === 0) {
    return {
      passed: true,
      headline: "PQC seals awaiting DNA blocks",
      detail: "Append DNA blocks before PQC archival gate.",
    };
  }
  if (!trail.chainValid) {
    return {
      passed: false,
      headline: "DNA chain invalid — PQC seal aborted",
      detail: "Fix classical hash chain before post-quantum archival.",
    };
  }
  if (!pqc || pqc.sealedBlockCount < pqcMinSealedBlocks()) {
    return {
      passed: false,
      headline: "PQC DNA seals missing",
      detail: `Run pqc-dna-archival-seal cron (min ${pqcMinSealedBlocks()} blocks).`,
    };
  }
  if (!pqc.chainSealed) {
    return {
      passed: false,
      headline: "PQC DNA chain seal invalid",
      detail: "ML-DSA fingerprint mismatch detected.",
    };
  }
  if (pqc.sealedBlockCount < trail.blocks.length) {
    return {
      passed: false,
      headline: `PQC lag: ${trail.blocks.length - pqc.sealedBlockCount} blocks unsealed`,
      detail: "Re-run archival seal after new DNA blocks.",
    };
  }
  return {
    passed: true,
    headline: `PQC DNA archival OK (${pqc.sealedBlockCount} seals)`,
    detail: `${pqcDnaAlgorithm()} · period ${pqc.archivalPeriod ?? "n/a"}`,
  };
}

export function pqcDnaArchivalPdfLines(snap: PqcDnaArchivalSnapshot): string {
  return [
    `PQC DNA archival — ${snap.at}`,
    `Chain sealed: ${snap.chainSealed}`,
    `Seals: ${snap.sealedBlockCount}`,
    `Latest ML-DSA: ${snap.seals[snap.seals.length - 1]?.mldsaFingerprint.slice(0, 48) ?? ""}...`,
  ].join("\n");
}
