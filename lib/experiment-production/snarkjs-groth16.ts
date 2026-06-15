/**
 * Optional snarkjs subprocess for real Groth16 prove/verify when artifacts exist.
 */

import "server-only";

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  circomDnaRollupWasmPath,
  circomDnaRollupVkeyPath,
} from "@/lib/experiment-production/crypto-backend";

export type SnarkjsProveResult = {
  proof: string;
  verified: boolean;
  source: "snarkjs" | "fallback";
};

function snarkjsBin(): string {
  return process.env.SNARKJS_BIN?.trim() || "npx";
}

function snarkjsArgs(subcmd: string, extra: string[]): string[] {
  if (snarkjsBin() === "npx") {
    return ["snarkjs", subcmd, ...extra];
  }
  return [subcmd, ...extra];
}

export function isSnarkjsGroth16Available(): boolean {
  const wasm = circomDnaRollupWasmPath();
  const zkey = circomDnaRollupVkeyPath();
  return Boolean(wasm && zkey && existsSync(wasm) && existsSync(zkey));
}

/**
 * Run `snarkjs g16 fullProve` when wasm/zkey/witness are configured.
 * Witness JSON: { "publicInputsHash": "<hex>" } written to temp file.
 */
export function snarkjsGroth16Prove(publicInputsHash: string): SnarkjsProveResult {
  const wasm = circomDnaRollupWasmPath();
  const zkey = circomDnaRollupVkeyPath();
  if (!wasm || !zkey || !existsSync(wasm) || !existsSync(zkey)) {
    return { proof: "", verified: false, source: "fallback" };
  }

  const workDir = join(tmpdir(), `kos-snarkjs-${Date.now()}`);
  mkdirSync(workDir, { recursive: true });
  const witnessPath = join(workDir, "witness.wtns");
  const proofPath = join(workDir, "proof.json");
  const publicPath = join(workDir, "public.json");

  writeFileSync(
    join(workDir, "input.json"),
    JSON.stringify({ publicInputsHash: publicInputsHash.replace(/^0x/, "") }),
  );

  const wtnsFromInput = process.env.CIRCOM_DNA_WITNESS_GEN?.trim();
  if (wtnsFromInput && existsSync(wtnsFromInput)) {
    try {
      const gen = spawnSync(wtnsFromInput, [join(workDir, "input.json"), witnessPath], {
        encoding: "utf8",
        timeout: 120_000,
      });
      if (gen.status !== 0) {
        return { proof: "", verified: false, source: "fallback" };
      }
    } catch {
      return { proof: "", verified: false, source: "fallback" };
    }
  } else if (process.env.CIRCOM_DNA_WITNESS_WTNS?.trim() && existsSync(process.env.CIRCOM_DNA_WITNESS_WTNS)) {
    writeFileSync(witnessPath, "");
  } else {
    return { proof: "", verified: false, source: "fallback" };
  }

  try {
    const prove = spawnSync(
      snarkjsBin(),
      snarkjsArgs("groth16", ["fullprove", witnessPath, wasm, zkey, proofPath, publicPath]),
      { encoding: "utf8", timeout: 180_000 },
    );
    if (prove.status !== 0) {
      return { proof: "", verified: false, source: "fallback" };
    }

    const vkey = circomDnaRollupVkeyPath();
    if (!vkey) return { proof: "", verified: false, source: "fallback" };

    const verify = spawnSync(
      snarkjsBin(),
      snarkjsArgs("groth16", ["verify", vkey, publicPath, proofPath]),
      { encoding: "utf8", timeout: 60_000 },
    );
    const proofDigest = createHash("sha256").update(`${publicInputsHash}:${proofPath}`).digest("hex");
    return {
      proof: proofDigest,
      verified: verify.status === 0 || verify.stdout?.includes("OK"),
      source: "snarkjs",
    };
  } catch {
    return { proof: "", verified: false, source: "fallback" };
  }
}
