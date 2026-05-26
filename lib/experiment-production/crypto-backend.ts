/**
 * Production vs simulation crypto backend selector (Layer D hardening).
 */

export type ExperimentCryptoBackend = "sim" | "prod";

export function experimentCryptoBackend(): ExperimentCryptoBackend {
  const v = process.env.THEME_EXPERIMENT_CRYPTO_BACKEND?.trim().toLowerCase();
  return v === "prod" ? "prod" : "sim";
}

export function isProductionCryptoBackend(): boolean {
  return experimentCryptoBackend() === "prod";
}

export function requireProductionCryptoInProd(): boolean {
  return process.env.THEME_EXPERIMENT_REQUIRE_PROD_CRYPTO === "1";
}

/** Circom/snarkjs artifact paths for production ZK. */
export function circomDnaRollupWasmPath(): string | null {
  return process.env.CIRCOM_DNA_ROLLUP_WASM?.trim() || null;
}

export function circomDnaRollupVkeyPath(): string | null {
  return process.env.CIRCOM_DNA_ROLLUP_VKEY?.trim() || null;
}

export function circomDnaRollupVkeyHash(): string | null {
  return process.env.CIRCOM_DNA_ROLLUP_VKEY_HASH?.trim() || null;
}

/** SEAL/HElib-compatible context id for homomorphic prod backend. */
export function sealHomomorphicContextId(): string {
  return process.env.SEAL_HOMOMORPHIC_CONTEXT_ID?.trim() || "kos-ckks-8192";
}

/** liboqs or HSM endpoint for PQC DNA seals. */
export function pqcSigningEndpoint(): string | null {
  return process.env.PQC_HSM_URL?.trim() || process.env.LIBOQS_SIGN_URL?.trim() || null;
}

export function pqcSigningApiKey(): string | null {
  return process.env.PQC_HSM_API_KEY?.trim() || null;
}
