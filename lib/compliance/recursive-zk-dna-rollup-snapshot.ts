/**
 * AA1 snapshot readers — edge/middleware-safe (no Groth16 prover imports).
 */

export type RecursiveZkBatchProof = {
  at: string;
  batchId: string;
  rollupChainHash: string;
  proofCount: number;
  childProofHashes: string[];
  publicBatchHash: string;
  groth16BatchProof: string;
  verified: boolean;
  circuit: "dna-recursive-rollup-v1";
  cryptoBackend?: "sim" | "prod";
};

export type RecursiveZkDnaRollupSnapshot = {
  at: string;
  batches: RecursiveZkBatchProof[];
  verificationRate: number;
  latestRollupChainHash: string | null;
};

export function isRecursiveZkDnaRollupEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_RECURSIVE_ZK_DNA_ROLLUP === "1";
}

export function recursiveZkMinBatchesForPublish(): number {
  return Number(process.env.THEME_EXPERIMENT_RECURSIVE_ZK_MIN_BATCHES ?? "1");
}

export function recursiveZkBatchSize(): number {
  return Number(process.env.THEME_EXPERIMENT_RECURSIVE_ZK_BATCH_SIZE ?? "4");
}

export function readRecursiveZkDnaRollup(raw: unknown): RecursiveZkDnaRollupSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).recursiveZkDnaRollup;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    batches: Array.isArray(s.batches) ? (s.batches as RecursiveZkBatchProof[]) : [],
    verificationRate: typeof s.verificationRate === "number" ? s.verificationRate : 0,
    latestRollupChainHash:
      typeof s.latestRollupChainHash === "string" ? s.latestRollupChainHash : null,
  };
}
