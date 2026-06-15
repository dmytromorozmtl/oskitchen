/**
 * Z1 snapshot readers — edge/middleware-safe (no Groth16 prover imports).
 */

export type ZkDnaRollupProof = {
  at: string;
  rollupId: string;
  trailCommitment: string;
  cellCount: number;
  storeQuorum: number;
  groth16Proof: string;
  publicInputsHash: string;
  verified: boolean;
  circuit: "dna-federation-rollup-v1";
  cryptoBackend?: "sim" | "prod";
};

export type ZkDnaRollupSnapshot = {
  at: string;
  rollups: ZkDnaRollupProof[];
  verificationRate: number;
  latestTrailCommitment: string | null;
};

export function isZkDnaRollupEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_ZK_DNA_ROLLUP === "1";
}

export function zkDnaMinRollupsForPublish(): number {
  return Number(process.env.THEME_EXPERIMENT_ZK_DNA_MIN_ROLLUPS ?? "1");
}

export function readZkDnaRollup(raw: unknown): ZkDnaRollupSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).zkDnaRollup;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    rollups: Array.isArray(s.rollups) ? (s.rollups as ZkDnaRollupProof[]) : [],
    verificationRate: typeof s.verificationRate === "number" ? s.verificationRate : 0,
    latestTrailCommitment:
      typeof s.latestTrailCommitment === "string" ? s.latestTrailCommitment : null,
  };
}
