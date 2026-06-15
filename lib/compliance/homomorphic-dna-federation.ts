/**
 * Y1 — Homomorphic DNA federation: FHE (CKKS-sim) merge of PQC-sealed DNA blocks across stores.
 */

import { createHash } from "node:crypto";
import { readPqcDnaArchival, isPqcDnaArchivalEnabled } from "@/lib/compliance/pqc-dna-archival";
import { homomorphicCiphertextHash } from "@/lib/experiment-production/homomorphic-seal-backend";
import {
  ckksHomomorphicAdd,
  ckksEncodeInteger,
  isHomomorphicMetricsEnabled,
  readHomomorphicMetrics,
} from "@/lib/storefront/theme-experiment-homomorphic-metrics";

export type FederatedPqcDnaCell = {
  at: string;
  storeSlug: string;
  blockIndex: number;
  mldsaFingerprint: string;
  fheCiphertextHash: string;
  kemBindingHash: string;
};

export type HomomorphicDnaFederationSnapshot = {
  at: string;
  cells: FederatedPqcDnaCell[];
  participatingStores: string[];
  storeQuorum: number;
  federationComplete: boolean;
  federatedChainHash: string;
  noiseBudgetRemaining: number;
};

export function isHomomorphicDnaFederationEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HOMOMORPHIC_DNA_FEDERATION === "1";
}

export function dnaFederationStoreQuorum(): number {
  return Number(process.env.THEME_EXPERIMENT_DNA_FEDERATION_QUORUM ?? "2");
}

export function readHomomorphicDnaFederation(raw: unknown): HomomorphicDnaFederationSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).homomorphicDnaFederation;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    cells: Array.isArray(s.cells) ? (s.cells as FederatedPqcDnaCell[]) : [],
    participatingStores: Array.isArray(s.participatingStores)
      ? (s.participatingStores as string[])
      : [],
    storeQuorum: typeof s.storeQuorum === "number" ? s.storeQuorum : 0,
    federationComplete: s.federationComplete === true,
    federatedChainHash: typeof s.federatedChainHash === "string" ? s.federatedChainHash : "",
    noiseBudgetRemaining: typeof s.noiseBudgetRemaining === "number" ? s.noiseBudgetRemaining : 0,
  };
}

function fheSealFingerprint(mldsaFingerprint: string, kemBindingHash: string): string {
  const combined = `${mldsaFingerprint}:${kemBindingHash}`;
  return homomorphicCiphertextHash(combined);
}

export function mergeHomomorphicDnaFederation(
  previousRaw: unknown,
  peerCells: FederatedPqcDnaCell[],
): { json: Record<string, unknown>; snap: HomomorphicDnaFederationSnapshot } {
  const prev = readHomomorphicDnaFederation(previousRaw);
  const pqc = readPqcDnaArchival(previousRaw);
  const hom = readHomomorphicMetrics(previousRaw);

  const localCells: FederatedPqcDnaCell[] = (pqc?.seals ?? []).map((s) => ({
    at: new Date().toISOString(),
    storeSlug: "local",
    blockIndex: s.blockIndex,
    mldsaFingerprint: s.mldsaFingerprint,
    fheCiphertextHash: fheSealFingerprint(s.mldsaFingerprint, s.kemBindingHash),
    kemBindingHash: s.kemBindingHash,
  }));

  const cells = [...(prev?.cells ?? []), ...localCells, ...peerCells].slice(-200);
  const stores = new Set(cells.map((c) => c.storeSlug));
  const storeQuorum = stores.size;

  let federatedChainHash = prev?.federatedChainHash ?? "";
  for (const c of cells) {
    federatedChainHash = createHash("sha256")
      .update(`${federatedChainHash}:${c.fheCiphertextHash}`)
      .digest("hex");
  }

  let fheAggregate = cells[0]?.fheCiphertextHash ?? "0";
  for (let i = 1; i < cells.length; i++) {
    fheAggregate = ckksHomomorphicAdd(fheAggregate, cells[i]!.fheCiphertextHash);
  }

  const noiseBudgetRemaining = Math.max(0, (hom?.noiseBudgetRemaining ?? 50) - cells.length);
  const quorumRequired = dnaFederationStoreQuorum();
  const federationComplete =
    storeQuorum >= quorumRequired && cells.length > 0 && noiseBudgetRemaining > 0;

  const snap: HomomorphicDnaFederationSnapshot = {
    at: new Date().toISOString(),
    cells,
    participatingStores: [...stores],
    storeQuorum,
    federationComplete,
    federatedChainHash,
    noiseBudgetRemaining,
  };

  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.homomorphicDnaFederation = snap;
  return { json: base, snap };
}

export function evaluateHomomorphicDnaFederationGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHomomorphicDnaFederationEnabled()) {
    return { passed: true, headline: "Homomorphic DNA federation off", detail: "" };
  }
  if (!isPqcDnaArchivalEnabled()) {
    return {
      passed: false,
      headline: "PQC DNA archival required",
      detail: "Enable THEME_EXPERIMENT_PQC_DNA_ARCHIVAL=1 (X1).",
    };
  }
  if (!isHomomorphicMetricsEnabled()) {
    return {
      passed: false,
      headline: "Homomorphic metrics required",
      detail: "Enable THEME_EXPERIMENT_HOMOMORPHIC_METRICS=1 (T1).",
    };
  }
  const fed = readHomomorphicDnaFederation(raw);
  const pqc = readPqcDnaArchival(raw);

  if (!pqc || pqc.sealedBlockCount === 0) {
    return {
      passed: true,
      headline: "Awaiting PQC DNA seals",
      detail: "Federation runs after local PQC archival.",
    };
  }
  if (!fed || !fed.federationComplete) {
    return {
      passed: false,
      headline: "DNA federation incomplete",
      detail: `Need ${dnaFederationStoreQuorum()} stores · have ${fed?.storeQuorum ?? 0}`,
    };
  }
  if (fed.noiseBudgetRemaining <= 0) {
    return {
      passed: false,
      headline: "FHE noise budget exhausted",
      detail: "Re-key homomorphic DNA federation context.",
    };
  }
  return {
    passed: true,
    headline: `Homomorphic DNA federation OK (${fed.participatingStores.length} stores)`,
    detail: `${fed.cells.length} FHE cells · quorum ${fed.storeQuorum}`,
  };
}
