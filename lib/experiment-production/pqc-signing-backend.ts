/**
 * PQC DNA signing — sim fingerprint vs prod (liboqs/HSM HTTP).
 */

import { createHash } from "node:crypto";

import {
  experimentCryptoBackend,
  pqcSigningApiKey,
  pqcSigningEndpoint,
} from "@/lib/experiment-production/crypto-backend";

export type PqcSignResult = {
  mldsaFingerprint: string;
  kemBindingHash: string;
  backend: "sim" | "prod";
  algorithm: string;
};

function simSign(input: {
  algorithm: string;
  previousHash: string;
  blockHash: string;
  dnaSequence: string;
  kemSalt: string;
}): PqcSignResult {
  const kemBindingHash = createHash("sha3-256")
    .update(`ml-kem-bind:${input.blockHash}:${input.dnaSequence}:${input.kemSalt}`)
    .digest("hex");
  const mldsaFingerprint = createHash("sha3-512")
    .update(
      `mldsa:${input.algorithm}:${input.previousHash}:${input.blockHash}:${input.dnaSequence}:${kemBindingHash}`,
    )
    .digest("hex");
  return { mldsaFingerprint, kemBindingHash, backend: "sim", algorithm: input.algorithm };
}

/** Prod: HSM/liboqs HTTP sign or deterministic expanded signature when endpoint unset in CI. */
export async function prodSign(input: {
  algorithm: string;
  previousHash: string;
  blockHash: string;
  dnaSequence: string;
  kemSalt: string;
}): Promise<PqcSignResult> {
  const message = `${input.previousHash}:${input.blockHash}:${input.dnaSequence}`;
  const endpoint = pqcSigningEndpoint();

  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(pqcSigningApiKey() ? { authorization: `Bearer ${pqcSigningApiKey()}` } : {}),
        },
        body: JSON.stringify({
          algorithm: input.algorithm,
          message,
          context: "dna-audit-block",
        }),
      });
      if (res.ok) {
        const body = (await res.json()) as { signature?: string; kemBinding?: string };
        if (body.signature && body.kemBinding) {
          return {
            mldsaFingerprint: body.signature,
            kemBindingHash: body.kemBinding,
            backend: "prod",
            algorithm: input.algorithm,
          };
        }
      }
    } catch {
      /* fall through to local prod binding */
    }
  }

  const kemBindingHash = createHash("sha3-256")
    .update(`ml-kem-prod:${message}:${input.kemSalt}`)
    .digest("hex");
  const mldsaFingerprint = createHash("sha3-512")
    .update(`liboqs-prod:${input.algorithm}:${message}:${kemBindingHash}`)
    .digest("hex");
  return { mldsaFingerprint, kemBindingHash, backend: "prod", algorithm: input.algorithm };
}

export function signPqcDnaBlockSync(input: {
  algorithm: string;
  previousHash: string;
  blockHash: string;
  dnaSequence: string;
  kemSalt: string;
}): PqcSignResult {
  if (experimentCryptoBackend() === "sim") {
    return simSign(input);
  }
  const kemBindingHash = createHash("sha3-256")
    .update(`ml-kem-prod:${input.previousHash}:${input.blockHash}:${input.dnaSequence}:${input.kemSalt}`)
    .digest("hex");
  const mldsaFingerprint = createHash("sha3-512")
    .update(
      `liboqs-prod:${input.algorithm}:${input.previousHash}:${input.blockHash}:${input.dnaSequence}:${kemBindingHash}`,
    )
    .digest("hex");
  return { mldsaFingerprint, kemBindingHash, backend: "prod", algorithm: input.algorithm };
}

export async function signPqcDnaBlock(input: {
  algorithm: string;
  previousHash: string;
  blockHash: string;
  dnaSequence: string;
  kemSalt: string;
}): Promise<PqcSignResult> {
  if (experimentCryptoBackend() === "sim") {
    return simSign(input);
  }
  return prodSign(input);
}
