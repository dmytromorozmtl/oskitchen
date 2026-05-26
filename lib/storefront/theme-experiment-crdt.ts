import { toJsonValue } from "@/lib/prisma/json";
export type ExperimentVersionVector = {
  logical: number;
  db: number;
  edge: number;
  updatedAt: string;
};

export function readVersionVector(raw: unknown, fallbackLogical = 0): ExperimentVersionVector {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      logical: fallbackLogical,
      db: fallbackLogical,
      edge: 0,
      updatedAt: new Date(0).toISOString(),
    };
  }
  const o = raw as Record<string, unknown>;
  const vv = o.versionVector;
  if (vv && typeof vv === "object" && !Array.isArray(vv)) {
    const v = vv as Record<string, unknown>;
    return {
      logical: typeof v.logical === "number" ? Math.floor(v.logical) : fallbackLogical,
      db: typeof v.db === "number" ? Math.floor(v.db) : fallbackLogical,
      edge: typeof v.edge === "number" ? Math.floor(v.edge) : 0,
      updatedAt: typeof v.updatedAt === "string" ? v.updatedAt : new Date().toISOString(),
    };
  }
  const version = typeof o.version === "number" ? Math.floor(o.version) : fallbackLogical;
  return {
    logical: version,
    db: version,
    edge: 0,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : new Date().toISOString(),
  };
}

export function bumpVersionVector(
  prev: ExperimentVersionVector,
  target: "db" | "edge",
): ExperimentVersionVector {
  const now = new Date().toISOString();
  const db = target === "db" ? prev.db + 1 : prev.db;
  const edge = target === "edge" ? prev.edge + 1 : prev.edge;
  const logical = Math.max(db, edge);
  return { logical, db, edge, updatedAt: now };
}

export function mergeVersionVectorOnSync(
  dbVector: ExperimentVersionVector,
  edgeVersion: number | null,
): ExperimentVersionVector {
  const edge = edgeVersion ?? dbVector.edge;
  return {
    logical: Math.max(dbVector.db, edge),
    db: dbVector.db,
    edge,
    updatedAt: new Date().toISOString(),
  };
}

export function versionVectorMatchesEdge(
  vector: ExperimentVersionVector,
  edgeVersion: number | null,
): boolean {
  if (edgeVersion === null) return false;
  return vector.logical === edgeVersion || vector.db === edgeVersion;
}

export function writeVersionVectorToJson(
  raw: unknown,
  vector: ExperimentVersionVector,
): Record<string, unknown> {
  const base =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};
  base.version = vector.logical;
  base.versionVector = vector;
  base.updatedAt = vector.updatedAt;
  return base;
}
