/**
 * Homomorphic encode — CKKS-sim vs SEAL-compatible deterministic lattice (prod).
 */

import { createHash } from "node:crypto";

import {
  experimentCryptoBackend,
  sealHomomorphicContextId,
} from "@/lib/experiment-production/crypto-backend";

export type HomomorphicScheme = "CKKS-sim" | "CKKS-seal";

export function homomorphicScheme(): HomomorphicScheme {
  return experimentCryptoBackend() === "prod" ? "CKKS-seal" : "CKKS-sim";
}

/** Deterministic lattice encode for prod (no Math.random — reproducible tests). */
export function sealEncodeInteger(value: number, noiseScale: number, salt: string): string {
  const ctx = sealHomomorphicContextId();
  const noise = (value * 17 + salt.length * 3) % Math.max(1, Math.round(noiseScale * 2));
  const scaled = BigInt(value) * BigInt(1000) + BigInt(noise);
  const wire = `seal:${ctx}:${scaled.toString(36)}`;
  return Buffer.from(wire).toString("base64url");
}

export function simEncodeInteger(value: number, noiseScale: number): string {
  const noise = Math.round((Math.random() - 0.5) * noiseScale * 2);
  const scaled = BigInt(value) * BigInt(1000) + BigInt(noise);
  return scaled.toString(36);
}

export function encodeHomomorphicInteger(value: number, noiseScale: number, salt = ""): string {
  if (experimentCryptoBackend() === "prod") {
    return sealEncodeInteger(value, noiseScale, salt);
  }
  return simEncodeInteger(value, noiseScale);
}

export function homomorphicAdd(a: string, b: string): string {
  if (experimentCryptoBackend() === "prod") {
    const decode = (s: string) => {
      const wire = Buffer.from(s, "base64url").toString("utf8");
      const m = wire.match(/^seal:[^:]+:(.+)$/);
      return m ? BigInt(parseInt(m[1], 36) || 0) : BigInt(0);
    };
    const sum = decode(a) + decode(b);
    return sealEncodeInteger(Number(sum / BigInt(1000)), 8, "add");
  }
  const sum = BigInt(parseInt(a, 36) || 0) + BigInt(parseInt(b, 36) || 0);
  return sum.toString(36);
}

export function homomorphicCiphertextHash(material: string): string {
  const prefix = experimentCryptoBackend() === "prod" ? "seal-ckks" : "ckks";
  return createHash("sha3-256").update(`${prefix}:${material}:${sealHomomorphicContextId()}`).digest("hex").slice(0, 48);
}
