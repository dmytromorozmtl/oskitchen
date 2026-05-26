/**
 * AJ5 — Omniverse epoch seal CRDT: final epoch stamp after AI5 reconciliation + AG5 counterfactual.
 */

import { createHash } from "node:crypto";
import {
  isMultiverseReconciliationCrdtEnabled,
  readMultiverseReconciliationCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-reconciliation-crdt";
import {
  isMultiverseCounterfactualCrdtEnabled,
  readMultiverseCounterfactualCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-counterfactual-crdt";

export type OmniverseEpochId = "epoch_genesis" | "epoch_collapse" | "epoch_sealed";

export type OmniverseEpochSeal = {
  at: string;
  epochId: OmniverseEpochId;
  epochNumber: number;
  sealedLiftPp: number;
  reconciliationToken: string | null;
  causallySealed: boolean;
  dagEpochConsistent: boolean;
};

export type OmniverseEpochSealCrdtSnapshot = {
  at: string;
  seals: OmniverseEpochSeal[];
  epochQuorum: number;
  quorumReached: boolean;
  reconciliationSynced: boolean;
  counterfactualSynced: boolean;
  dagAcyclicPreserved: boolean;
  consensusSealedLiftPp: number;
  omniverseEpochSealed: boolean;
};

export const OMNIVERSE_EPOCHS: OmniverseEpochId[] = [
  "epoch_genesis",
  "epoch_collapse",
  "epoch_sealed",
];

export function isOmniverseEpochSealCrdtEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_OMNIVERSE_EPOCH_SEAL_CRDT === "1";
}

export function omniverseEpochQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_OMNIVERSE_EPOCH_QUORUM ?? "0.67");
}

export function readOmniverseEpochSealCrdt(raw: unknown): OmniverseEpochSealCrdtSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).omniverseEpochSealCrdt;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    seals: Array.isArray(s.seals) ? (s.seals as OmniverseEpochSeal[]) : [],
    epochQuorum: typeof s.epochQuorum === "number" ? s.epochQuorum : 0,
    quorumReached: s.quorumReached === true,
    reconciliationSynced: s.reconciliationSynced === true,
    counterfactualSynced: s.counterfactualSynced === true,
    dagAcyclicPreserved: s.dagAcyclicPreserved === true,
    consensusSealedLiftPp: typeof s.consensusSealedLiftPp === "number" ? s.consensusSealedLiftPp : 0,
    omniverseEpochSealed: s.omniverseEpochSealed === true,
  };
}

function mergeEpochSealIntoJson(
  previousRaw: unknown,
  snap: OmniverseEpochSealCrdtSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.omniverseEpochSealCrdt = snap;
  return base;
}

export function ingestOmniverseEpochSeals(
  previousRaw: unknown,
  cells: Omit<OmniverseEpochSeal, "at" | "reconciliationToken" | "causallySealed" | "dagEpochConsistent">[],
): { json: Record<string, unknown>; snap: OmniverseEpochSealCrdtSnapshot } {
  const rec = readMultiverseReconciliationCrdt(previousRaw);
  const cf = readMultiverseCounterfactualCrdt(previousRaw);
  const token = rec
    ? createHash("sha256")
        .update(`${rec.branchQuorum}:${rec.consensusReconciledLiftPp}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const baseLift = rec?.consensusReconciledLiftPp ?? cf?.mergedWhatIfLiftPp ?? 2.0;
  const seals: OmniverseEpochSeal[] = cells.map((c) => ({
    ...c,
    at: new Date().toISOString(),
    reconciliationToken: token,
    causallySealed: rec?.divergentBranchesCollapsed ?? false,
    dagEpochConsistent: (cf?.omniverseDagAcyclic ?? false) && (rec?.dagAcyclicPreserved ?? false),
  }));

  const prev = readOmniverseEpochSealCrdt(previousRaw);
  const all = [...(prev?.seals ?? []), ...seals].slice(-60);
  const epochSet = new Set(all.map((s) => s.epochId));
  const quorumRequired = Math.max(2, Math.ceil(OMNIVERSE_EPOCHS.length * omniverseEpochQuorumFraction()));
  const quorumReached = epochSet.size >= quorumRequired;

  const consensusSealedLiftPp =
    all.length > 0 ? all.reduce((sum, s) => sum + s.sealedLiftPp, 0) / all.length : 0;
  const liftDrift = Math.abs(consensusSealedLiftPp - baseLift);
  const omniverseEpochSealed = quorumReached && liftDrift <= 0.25 && all.every((s) => s.causallySealed);

  const snap: OmniverseEpochSealCrdtSnapshot = {
    at: new Date().toISOString(),
    seals: all,
    epochQuorum: epochSet.size,
    quorumReached,
    reconciliationSynced: rec?.quorumReached ?? false,
    counterfactualSynced: cf?.omniverseSynced ?? false,
    dagAcyclicPreserved: (cf?.omniverseDagAcyclic ?? false) && (rec?.dagAcyclicPreserved ?? false),
    consensusSealedLiftPp,
    omniverseEpochSealed,
  };

  return { json: mergeEpochSealIntoJson(previousRaw, snap), snap };
}

export function sealOmniverseEpochFromReconciliation(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: OmniverseEpochSealCrdtSnapshot } {
  const rec = readMultiverseReconciliationCrdt(previousRaw);
  const lift = rec?.consensusReconciledLiftPp ?? 2.0;
  const cells = OMNIVERSE_EPOCHS.map((epochId, i) => ({
    epochId,
    epochNumber: i + 1,
    sealedLiftPp: lift * (1 - i * 0.01),
  }));
  return ingestOmniverseEpochSeals(previousRaw, cells);
}

export function evaluateOmniverseEpochSealCrdtGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isOmniverseEpochSealCrdtEnabled()) {
    return { passed: true, headline: "Omniverse epoch seal CRDT off", detail: "" };
  }
  if (!isMultiverseReconciliationCrdtEnabled()) {
    return {
      passed: false,
      headline: "Multiverse reconciliation CRDT required",
      detail: "Enable THEME_EXPERIMENT_MULTIVERSE_RECONCILIATION_CRDT=1 (AI5).",
    };
  }
  if (!isMultiverseCounterfactualCrdtEnabled()) {
    return {
      passed: false,
      headline: "Multiverse counterfactual CRDT required",
      detail: "Enable THEME_EXPERIMENT_MULTIVERSE_COUNTERFACTUAL_CRDT=1 (AG5).",
    };
  }
  const rec = readMultiverseReconciliationCrdt(raw);
  if (!rec?.divergentBranchesCollapsed) {
    return {
      passed: false,
      headline: "Reconciliation not collapsed",
      detail: "Complete AI5 multiverse reconciliation before epoch seal.",
    };
  }
  const snap = readOmniverseEpochSealCrdt(raw);
  if (!snap?.omniverseEpochSealed || !snap.quorumReached) {
    return {
      passed: false,
      headline: "Omniverse epoch not sealed",
      detail: "Seal genesis/collapse/final epochs over reconciled multiverse.",
    };
  }
  if (!snap.dagAcyclicPreserved) {
    return {
      passed: false,
      headline: "DAG epoch consistency lost",
      detail: "Re-sync reconciliation CRDT before omniverse epoch seal.",
    };
  }
  return {
    passed: true,
    headline: "Omniverse epoch seal CRDT aligned",
    detail: `${snap.epochQuorum} epochs · consensus ${snap.consensusSealedLiftPp.toFixed(1)}pp sealed`,
  };
}
