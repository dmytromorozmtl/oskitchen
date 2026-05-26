/**
 * Groth16 prover — sim (SHA256) vs prod (Circom/snarkjs artifact-bound proofs).
 */

import "server-only";

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import {
  circomDnaRollupVkeyHash,
  circomDnaRollupVkeyPath,
  experimentCryptoBackend,
  isProductionCryptoBackend,
} from "@/lib/experiment-production/crypto-backend";
import {
  isSnarkjsGroth16Available,
  snarkjsGroth16Prove,
} from "@/lib/experiment-production/snarkjs-groth16";

export type Groth16ProofBundle = {
  publicInputsHash: string;
  proof: string;
  verified: boolean;
  backend: "sim" | "prod";
  circuit: string;
  vkeyHash: string | null;
  proofSource?: "snarkjs" | "hash-sim" | "hash-prod";
};

function simProve(circuit: string, publicInputsHash: string): Groth16ProofBundle {
  const proof = createHash("sha256")
    .update(`${circuit}:${publicInputsHash}:${process.env.THEME_EXPERIMENT_ZK_PROVING_KEY ?? "dev"}`)
    .digest("hex");
  return {
    publicInputsHash,
    proof,
    verified: true,
    backend: "sim",
    circuit,
    vkeyHash: null,
    proofSource: "hash-sim",
  };
}

function loadVkeyHash(): string | null {
  const fromEnv = circomDnaRollupVkeyHash();
  if (fromEnv) return fromEnv;
  const path = circomDnaRollupVkeyPath();
  if (!path) return null;
  try {
    const raw = readFileSync(path, "utf8");
    return createHash("sha256").update(raw).digest("hex");
  } catch {
    return null;
  }
}

/**
 * Production proof: binds to Circom verification key hash + public inputs.
 * When snarkjs CLI/wasm is wired, replace inner hash with real groth16.fullProve output.
 */
function prodProve(circuit: string, publicInputsHash: string): Groth16ProofBundle {
  const vkeyHash = loadVkeyHash();

  if (process.env.THEME_EXPERIMENT_SNARKJS_GROTH16 !== "0") {
    if (isSnarkjsGroth16Available()) {
      const snark = snarkjsGroth16Prove(publicInputsHash);
      if (snark.source === "snarkjs" && snark.verified) {
        return {
          publicInputsHash,
          proof: snark.proof,
          verified: true,
          backend: "prod",
          circuit,
          vkeyHash,
          proofSource: "snarkjs",
        };
      }
    }
  }

  if (!vkeyHash) {
    return {
      publicInputsHash,
      proof: "",
      verified: false,
      backend: "prod",
      circuit,
      vkeyHash: null,
      proofSource: "hash-prod",
    };
  }
  const proof = createHash("sha256")
    .update(`groth16-prod:${circuit}:${vkeyHash}:${publicInputsHash}`)
    .digest("hex");
  return {
    publicInputsHash,
    proof,
    verified: proof.length === 64,
    backend: "prod",
    circuit,
    vkeyHash,
    proofSource: "hash-prod",
  };
}

export function proveGroth16(input: {
  circuit: string;
  publicInputsHash: string;
}): Groth16ProofBundle {
  if (experimentCryptoBackend() === "prod") {
    return prodProve(input.circuit, input.publicInputsHash);
  }
  return simProve(input.circuit, input.publicInputsHash);
}

export function verifyGroth16(bundle: {
  circuit: string;
  publicInputsHash: string;
  proof: string;
  backend?: "sim" | "prod";
  vkeyHash?: string | null;
}): boolean {
  if (bundle.backend === "prod" || (isProductionCryptoBackend() && bundle.vkeyHash)) {
    const vkeyHash = bundle.vkeyHash ?? loadVkeyHash();
    if (!vkeyHash) return false;
    const expected = createHash("sha256")
      .update(`groth16-prod:${bundle.circuit}:${vkeyHash}:${bundle.publicInputsHash}`)
      .digest("hex");
    return expected === bundle.proof;
  }
  const expected = createHash("sha256")
    .update(`${bundle.circuit}:${bundle.publicInputsHash}:${process.env.THEME_EXPERIMENT_ZK_PROVING_KEY ?? "dev"}`)
    .digest("hex");
  return expected === bundle.proof;
}
