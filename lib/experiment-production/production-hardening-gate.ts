/**
 * Aggregate production hardening gate (Layer D + strict env).
 */

import { readPqcDnaArchival } from "@/lib/compliance/pqc-dna-archival";
import { readRecursiveZkDnaRollup } from "@/lib/compliance/recursive-zk-dna-rollup";
import { readZkDnaRollup } from "@/lib/compliance/zk-dna-rollup";
import {
  isProductionCryptoBackend,
  requireProductionCryptoInProd,
} from "@/lib/experiment-production/crypto-backend";
import { evaluateStrictEnvGate } from "@/lib/experiment-production/strict-env-validator";
import { verifyGroth16 } from "@/lib/experiment-production/zk-groth16-prover";

export type ProductionHardeningSnapshot = {
  at: string;
  cryptoBackend: "sim" | "prod";
  pqcBackend: "sim" | "prod" | null;
  zkBackend: "sim" | "prod" | null;
  strictEnvPassed: boolean;
};

export function isProductionHardeningGateEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_PRODUCTION_HARDENING === "1";
}

export function readProductionHardening(raw: unknown): ProductionHardeningSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).productionHardening;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  return o as ProductionHardeningSnapshot;
}

export function mergeProductionHardening(
  previousRaw: unknown,
  snap: ProductionHardeningSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.productionHardening = snap;
  return base;
}

export function evaluateProductionHardeningGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isProductionHardeningGateEnabled()) {
    return { passed: true, headline: "Production hardening off", detail: "" };
  }

  const strict = evaluateStrictEnvGate();
  if (!strict.passed) {
    return { passed: false, headline: strict.headline, detail: strict.detail };
  }

  if (isProductionCryptoBackend() || requireProductionCryptoInProd()) {
    const pqc = readPqcDnaArchival(raw);
    const latestSeal = pqc?.seals[pqc.seals.length - 1];
    if (latestSeal && !(latestSeal as { backend?: string }).backend) {
      if (requireProductionCryptoInProd()) {
        return {
          passed: false,
          headline: "PQC seals not from production backend",
          detail: "Re-seal DNA trail with THEME_EXPERIMENT_CRYPTO_BACKEND=prod.",
        };
      }
    }

    const zk = readZkDnaRollup(raw);
    const latestZk = zk?.rollups[zk.rollups.length - 1];
    if (latestZk) {
      const ok = verifyGroth16({
        circuit: latestZk.circuit,
        publicInputsHash: latestZk.publicInputsHash,
        proof: latestZk.groth16Proof,
        backend: isProductionCryptoBackend() ? "prod" : "sim",
        vkeyHash: null,
      });
      if (isProductionCryptoBackend() && !ok) {
        return {
          passed: false,
          headline: "ZK rollup prod verification failed",
          detail: "Configure CIRCOM_DNA_ROLLUP_VKEY_HASH and re-run rollup.",
        };
      }
    }

    const recursive = readRecursiveZkDnaRollup(raw);
    const latestBatch = recursive?.batches[recursive.batches.length - 1];
    if (latestBatch && isProductionCryptoBackend() && !latestBatch.verified) {
      return {
        passed: false,
        headline: "Recursive ZK batch not verified (prod)",
        detail: "Run recursive-zk-dna-rollup cron with prod vkey.",
      };
    }
  }

  return {
    passed: true,
    headline: `Production hardening OK (${isProductionCryptoBackend() ? "prod" : "sim"} crypto)`,
    detail: strict.detail || "Strict env and crypto backends aligned.",
  };
}
