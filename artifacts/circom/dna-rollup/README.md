# Circom DNA rollup artifacts (staging)

Place compiled Groth16 artifacts for the DNA rollup circuit before running Tier 2 staging game-day:

- `circuit.wasm`
- `circuit_final.zkey`
- `verification_key.json`

Deploy to staging:

```bash
./scripts/staging-circom-dna-rollup.sh
```

Set on the staging host:

- `THEME_EXPERIMENT_CRYPTO_BACKEND=prod`
- `THEME_EXPERIMENT_SNARKJS_GROTH16=1`
- `CIRCOM_DNA_ROLLUP_WASM`, `CIRCOM_DNA_ROLLUP_VKEY`, `CIRCOM_DNA_ROLLUP_VKEY_HASH`

Verify: `npx vitest run tests/unit/experiment-production-crypto.test.ts`
