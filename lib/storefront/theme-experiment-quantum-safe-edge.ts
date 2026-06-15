/**
 * Edge middleware — env flags + classical bucket only (no node:crypto sha3 in edge bundle).
 */
import { stableBucketPercent } from "@/lib/storefront/theme-experiment-bucket";

export function isQuantumSafeAssignmentEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_QUANTUM_SAFE === "1";
}

/** On Edge runtime use classical bucket; full ML-KEM hybrid runs on Node server/cron paths. */
export function hybridAssignmentBucket(visitorId: string, _mode: "xor" | "weighted" = "weighted"): number {
  return stableBucketPercent(visitorId);
}
