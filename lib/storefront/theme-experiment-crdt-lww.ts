import type { ExperimentVersionVector } from "@/lib/storefront/theme-experiment-crdt";
export type CrdtTombstone = {
  key: string;
  deletedAt: string;
  vector: number;
};

export type CrdtLwwState = {
  vector: ExperimentVersionVector;
  tombstones: CrdtTombstone[];
};

export function readCrdtLwwState(raw: unknown): CrdtLwwState | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).crdtLww;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const state = o as Record<string, unknown>;
  const vv = state.vector;
  if (!vv || typeof vv !== "object" || Array.isArray(vv)) return null;
  const v = vv as Record<string, unknown>;
  return {
    vector: {
      logical: typeof v.logical === "number" ? v.logical : 0,
      db: typeof v.db === "number" ? v.db : 0,
      edge: typeof v.edge === "number" ? v.edge : 0,
      updatedAt: typeof v.updatedAt === "string" ? v.updatedAt : new Date().toISOString(),
    },
    tombstones: Array.isArray(state.tombstones) ? (state.tombstones as CrdtTombstone[]) : [],
  };
}

/** Last-write-wins merge: higher logical version wins; tombstones block keys. */
export function mergeCrdtLww(
  local: CrdtLwwState,
  remote: CrdtLwwState,
): { merged: CrdtLwwState; conflict: boolean } {
  const conflict = local.vector.logical !== remote.vector.logical;
  const winner = local.vector.logical >= remote.vector.logical ? local : remote;
  const loser = winner === local ? remote : local;

  const tombstoneMap = new Map<string, CrdtTombstone>();
  for (const t of [...winner.tombstones, ...loser.tombstones]) {
    const prev = tombstoneMap.get(t.key);
    if (!prev || t.vector > prev.vector) tombstoneMap.set(t.key, t);
  }

  return {
    merged: {
      vector: {
        logical: Math.max(local.vector.logical, remote.vector.logical),
        db: Math.max(local.vector.db, remote.vector.db),
        edge: Math.max(local.vector.edge, remote.vector.edge),
        updatedAt: new Date().toISOString(),
      },
      tombstones: [...tombstoneMap.values()],
    },
    conflict,
  };
}

export function writeCrdtLwwToJson(
  raw: unknown,
  state: CrdtLwwState,
): Record<string, unknown> {
  const base =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};
  base.crdtLww = state;
  base.versionVector = state.vector;
  base.version = state.vector.logical;
  return base;
}

export function addCrdtTombstone(
  state: CrdtLwwState,
  key: string,
): CrdtLwwState {
  return {
    ...state,
    tombstones: [
      ...state.tombstones.filter((t) => t.key !== key),
      { key, deletedAt: new Date().toISOString(), vector: state.vector.logical },
    ],
  };
}
