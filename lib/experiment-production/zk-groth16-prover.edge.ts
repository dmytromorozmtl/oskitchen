/**
 * Edge/middleware-safe Groth16 — hash sim only (no snarkjs, no node:child_process).
 */
import { createHash } from "crypto";

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

export function proveGroth16(input: {
  circuit: string;
  publicInputsHash: string;
}): Groth16ProofBundle {
  return simProve(input.circuit, input.publicInputsHash);
}

export function verifyGroth16(bundle: {
  circuit: string;
  publicInputsHash: string;
  proof: string;
  backend?: "sim" | "prod";
  vkeyHash?: string | null;
}): boolean {
  const expected = createHash("sha256")
    .update(`${bundle.circuit}:${bundle.publicInputsHash}:${process.env.THEME_EXPERIMENT_ZK_PROVING_KEY ?? "dev"}`)
    .digest("hex");
  return expected === bundle.proof;
}
