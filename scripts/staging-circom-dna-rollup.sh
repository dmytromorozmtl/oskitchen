#!/usr/bin/env bash
# Deploy Circom DNA rollup artifacts to staging and enable snarkjs path.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CIRCOM_DIR="${CIRCOM_DNA_ARTIFACTS_DIR:-$ROOT/artifacts/circom/dna-rollup}"

echo "== KitchenOS staging Circom DNA rollup =="
echo "Artifacts dir: $CIRCOM_DIR"

if [[ ! -f "$CIRCOM_DIR/circuit.wasm" ]]; then
  echo "WARN: $CIRCOM_DIR/circuit.wasm missing — place compiled circuit artifacts before Tier 1."
  echo "  Expected: circuit.wasm, circuit_final.zkey, verification_key.json"
  exit 1
fi

export THEME_EXPERIMENT_CRYPTO_BACKEND=prod
export THEME_EXPERIMENT_SNARKJS_GROTH16=1
export CIRCOM_DNA_ROLLUP_WASM="$CIRCOM_DIR/circuit.wasm"
export CIRCOM_DNA_ROLLUP_VKEY="$CIRCOM_DIR/circuit_final.zkey"
export CIRCOM_DNA_ROLLUP_VKEY_HASH="${CIRCOM_DNA_ROLLUP_VKEY_HASH:-$(shasum -a 256 "$CIRCOM_DIR/verification_key.json" | awk '{print $1}')}"

echo "CIRCOM_DNA_ROLLUP_WASM=$CIRCOM_DNA_ROLLUP_WASM"
echo "CIRCOM_DNA_ROLLUP_VKEY=$CIRCOM_DNA_ROLLUP_VKEY"
echo "CIRCOM_DNA_ROLLUP_VKEY_HASH=$CIRCOM_DNA_ROLLUP_VKEY_HASH"
echo "Run vitest: npx vitest run tests/unit/experiment-production-crypto.test.ts"
