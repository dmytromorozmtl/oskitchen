/**
 * W1 — DNA-encoded experiment audit trail: hash chain + base-4 (ATGC) encoding for compact immutable archive.
 */

import { createHash } from "node:crypto";
import { buildSoc2Type2EvidenceBinder } from "@/lib/compliance/soc2-control-mapping";
import {
  isGlobalExperimentMeshEnabled,
  readGlobalExperimentMesh,
} from "@/lib/storefront/theme-experiment-global-mesh";

export type DnaBase = "A" | "T" | "G" | "C";

export type DnaAuditBlock = {
  at: string;
  blockIndex: number;
  eventType: string;
  payloadHash: string;
  previousHash: string;
  blockHash: string;
  dnaSequence: string;
  basePairs: number;
};

export type DnaAuditTrailSnapshot = {
  at: string;
  blocks: DnaAuditBlock[];
  chainValid: boolean;
  totalBasePairs: number;
  soc2Period: string | null;
};

const BASES: DnaBase[] = ["A", "T", "G", "C"];

/** Encode hex hash into ATGC sequence (2 bits per base). */
export function encodeHashToDna(hex: string, maxBases: number = 128): string {
  const clean = hex.replace(/[^a-f0-9]/gi, "");
  let out = "";
  for (let i = 0; i < clean.length && out.length < maxBases; i++) {
    const nibble = parseInt(clean[i]!, 16);
    out += BASES[(nibble >> 1) & 3]!;
    out += BASES[nibble & 3]!;
  }
  return out;
}

export function isDnaAuditTrailEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_DNA_AUDIT_TRAIL === "1";
}

export function dnaMaxBlocks(): number {
  return Number(process.env.THEME_EXPERIMENT_DNA_MAX_BLOCKS ?? "500");
}

export function readDnaAuditTrail(raw: unknown): DnaAuditTrailSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).dnaAuditTrail;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    blocks: Array.isArray(s.blocks) ? (s.blocks as DnaAuditBlock[]) : [],
    chainValid: s.chainValid === true,
    totalBasePairs: typeof s.totalBasePairs === "number" ? s.totalBasePairs : 0,
    soc2Period: typeof s.soc2Period === "string" ? s.soc2Period : null,
  };
}

function computeBlockHash(previousHash: string, payloadHash: string, eventType: string): string {
  return createHash("sha256").update(`${previousHash}:${payloadHash}:${eventType}`).digest("hex");
}

export function appendDnaAuditBlock(
  previousRaw: unknown,
  event: { eventType: string; payload: unknown },
): { json: Record<string, unknown>; block: DnaAuditBlock; chainValid: boolean } {
  const prev = readDnaAuditTrail(previousRaw);
  const blocks = prev?.blocks ?? [];
  const previousHash = blocks.length > 0 ? blocks[blocks.length - 1]!.blockHash : "genesis";
  const payloadHash = createHash("sha256").update(JSON.stringify(event.payload)).digest("hex");
  const blockHash = computeBlockHash(previousHash, payloadHash, event.eventType);
  const dnaSequence = encodeHashToDna(blockHash);

  const block: DnaAuditBlock = {
    at: new Date().toISOString(),
    blockIndex: blocks.length,
    eventType: event.eventType,
    payloadHash,
    previousHash,
    blockHash,
    dnaSequence,
    basePairs: dnaSequence.length,
  };

  const nextBlocks = [...blocks, block].slice(-dnaMaxBlocks());
  let chainValid = true;
  for (let i = 0; i < nextBlocks.length; i++) {
    const b = nextBlocks[i]!;
    const expectedPrev = i === 0 ? "genesis" : nextBlocks[i - 1]!.blockHash;
    if (b.previousHash !== expectedPrev) chainValid = false;
    const expected = computeBlockHash(b.previousHash, b.payloadHash, b.eventType);
    if (expected !== b.blockHash) chainValid = false;
  }

  const soc2 = buildSoc2Type2EvidenceBinder();
  const snap: DnaAuditTrailSnapshot = {
    at: new Date().toISOString(),
    blocks: nextBlocks,
    chainValid,
    totalBasePairs: nextBlocks.reduce((s, b) => s + b.basePairs, 0),
    soc2Period: soc2.period,
  };

  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.dnaAuditTrail = snap;
  return { json: base, block, chainValid };
}

export function evaluateDnaAuditTrailGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isDnaAuditTrailEnabled()) {
    return { passed: true, headline: "DNA audit trail off", detail: "" };
  }
  const trail = readDnaAuditTrail(raw);
  const mesh = readGlobalExperimentMesh(raw);

  if (!trail || trail.blocks.length === 0) {
    return {
      passed: true,
      headline: "DNA trail accumulating",
      detail: "Append blocks on experiment events before strict gate.",
    };
  }
  if (!trail.chainValid) {
    return {
      passed: false,
      headline: "DNA hash chain invalid",
      detail: "Immutable audit trail tamper detected.",
    };
  }
  if (isGlobalExperimentMeshEnabled() && mesh && !mesh.quorumReached) {
    return {
      passed: false,
      headline: "DNA trail requires global mesh quorum",
      detail: "Cross-cloud outcomes must sync before DNA-sealed publish.",
    };
  }
  return {
    passed: true,
    headline: `DNA trail OK (${trail.blocks.length} blocks)`,
    detail: `${trail.totalBasePairs} base pairs · SOC2 ${trail.soc2Period ?? "n/a"}`,
  };
}

export function dnaTrailPdfLines(trail: DnaAuditTrailSnapshot): string {
  return [
    `DNA-encoded audit trail — ${trail.at}`,
    `Chain valid: ${trail.chainValid}`,
    `Blocks: ${trail.blocks.length} · base pairs: ${trail.totalBasePairs}`,
    `Latest: ${trail.blocks[trail.blocks.length - 1]?.dnaSequence.slice(0, 40) ?? ""}...`,
  ].join("\n");
}
