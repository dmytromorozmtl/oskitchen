/**
 * AE5 — Multiverse outcome superposition CRDT over AD5 cosmic web federation.
 */

import { createHash } from "node:crypto";
import {
  isCosmicWebFederationEnabled,
  readCosmicWebFederation,
} from "@/lib/storefront/theme-experiment-cosmic-web-federation";

export type MultiverseBranchId = "alpha" | "beta" | "gamma";

export type MultiverseSuperpositionCell = {
  at: string;
  branch: MultiverseBranchId;
  armId: string;
  liftPp: number;
  probabilityAmplitude: number;
  crdtVector: number;
  superpositionHash: string;
};

export type MultiverseOutcomeCrdtSnapshot = {
  at: string;
  branches: MultiverseSuperpositionCell[];
  branchQuorum: number;
  quorumReached: boolean;
  cosmicWebSynced: boolean;
  collapsedArmId: string | null;
  coherenceScore: number;
};

export const MULTIVERSE_BRANCHES: MultiverseBranchId[] = ["alpha", "beta", "gamma"];

export function isMultiverseOutcomeCrdtEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_MULTIVERSE_OUTCOME_CRDT === "1";
}

export function multiverseQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_MULTIVERSE_QUORUM ?? "0.67");
}

function superpositionHash(cells: MultiverseSuperpositionCell[]): string {
  const payload = cells.map((c) => `${c.branch}:${c.crdtVector}:${c.armId}`).join("|");
  return createHash("sha256").update(`multiverse:${payload}`).digest("hex");
}

export function readMultiverseOutcomeCrdt(raw: unknown): MultiverseOutcomeCrdtSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).multiverseOutcomeCrdt;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    branches: Array.isArray(s.branches) ? (s.branches as MultiverseSuperpositionCell[]) : [],
    branchQuorum: typeof s.branchQuorum === "number" ? s.branchQuorum : 0,
    quorumReached: s.quorumReached === true,
    cosmicWebSynced: s.cosmicWebSynced === true,
    collapsedArmId: typeof s.collapsedArmId === "string" ? s.collapsedArmId : null,
    coherenceScore: typeof s.coherenceScore === "number" ? s.coherenceScore : 0,
  };
}

function mergeMultiverseIntoJson(
  previousRaw: unknown,
  snap: MultiverseOutcomeCrdtSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.multiverseOutcomeCrdt = snap;
  return base;
}

export function ingestMultiverseSuperpositionCells(
  previousRaw: unknown,
  cells: Omit<MultiverseSuperpositionCell, "at" | "crdtVector" | "superpositionHash">[],
): { json: Record<string, unknown>; snap: MultiverseOutcomeCrdtSnapshot } {
  const prev = readMultiverseOutcomeCrdt(previousRaw);
  const baseVector = prev?.branches.length ?? 0;
  const branches: MultiverseSuperpositionCell[] = cells.map((c, i) => ({
    ...c,
    at: new Date().toISOString(),
    crdtVector: baseVector + i + 1,
    superpositionHash: "",
  }));
  const all = [...(prev?.branches ?? []), ...branches].slice(-90);
  const hash = superpositionHash(all);
  for (const b of all) {
    if (!b.superpositionHash) b.superpositionHash = hash;
  }

  const branchSet = new Set(all.map((b) => b.branch));
  const quorumRequired = Math.max(2, Math.ceil(MULTIVERSE_BRANCHES.length * multiverseQuorumFraction()));
  const quorumReached = branchSet.size >= quorumRequired;

  const cosmic = readCosmicWebFederation(previousRaw);
  const cosmicWebSynced = (cosmic?.quorumReached ?? false) && quorumReached;

  const byArm = new Map<string, number>();
  for (const b of all) {
    byArm.set(b.armId, (byArm.get(b.armId) ?? 0) + b.probabilityAmplitude);
  }
  let collapsedArmId: string | null = null;
  let best = 0;
  for (const [armId, amp] of byArm) {
    if (amp > best) {
      best = amp;
      collapsedArmId = armId;
    }
  }

  const coherenceScore =
    all.length > 0
      ? all.reduce((s, b) => s + b.probabilityAmplitude * b.liftPp, 0) / all.length
      : 0;

  const snap: MultiverseOutcomeCrdtSnapshot = {
    at: new Date().toISOString(),
    branches: all,
    branchQuorum: branchSet.size,
    quorumReached,
    cosmicWebSynced,
    collapsedArmId,
    coherenceScore,
  };

  return { json: mergeMultiverseIntoJson(previousRaw, snap), snap };
}

export function collapseMultiverseFromCosmicWeb(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: MultiverseOutcomeCrdtSnapshot } {
  const cosmic = readCosmicWebFederation(previousRaw);
  const cells = MULTIVERSE_BRANCHES.map((branch, i) => ({
    branch,
    armId: cosmic?.filaments[i]?.armId ?? "draft",
    liftPp: cosmic?.filaments[i]?.liftPp ?? 2.0,
    probabilityAmplitude: 0.33 + i * 0.05,
  }));
  return ingestMultiverseSuperpositionCells(previousRaw, cells);
}

export function evaluateMultiverseOutcomeCrdtGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isMultiverseOutcomeCrdtEnabled()) {
    return { passed: true, headline: "Multiverse outcome CRDT off", detail: "" };
  }
  if (!isCosmicWebFederationEnabled()) {
    return {
      passed: false,
      headline: "Cosmic web federation required",
      detail: "Enable THEME_EXPERIMENT_COSMIC_WEB_FEDERATION=1 (AD5).",
    };
  }
  const snap = readMultiverseOutcomeCrdt(raw);
  if (!snap?.quorumReached) {
    return {
      passed: false,
      headline: "Multiverse branch quorum missing",
      detail: `Need ${Math.ceil(MULTIVERSE_BRANCHES.length * multiverseQuorumFraction())} branches.`,
    };
  }
  if (!snap.cosmicWebSynced) {
    return {
      passed: false,
      headline: "Cosmic web not synced with multiverse CRDT",
      detail: "Run cosmic web federation sync first.",
    };
  }
  if (!snap.collapsedArmId) {
    return {
      passed: false,
      headline: "Multiverse wavefunction not collapsed",
      detail: "Ingest superposition branches before publish.",
    };
  }
  return {
    passed: true,
    headline: "Multiverse outcome CRDT aligned",
    detail: `Collapsed ${snap.collapsedArmId} · coherence ${snap.coherenceScore.toFixed(2)}`,
  };
}
