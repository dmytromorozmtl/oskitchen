# Offline POS PCI — noop-v1 QSA review (P2-44)

**Policy:** `offline-pos-pci-noop-v1-p2-44-v1`  
**Decision:** `retain-empty-only` — **do not remove** the `noop-v1` algorithm type

Engineering pre-QSA review for gap P2-44: `lib/pos/offline-pci-local-encryption.ts` noop-v1 fallback.

## QSA checklist

| Item | Status |
|------|--------|
| `empty-only-noop-v1-seal` | **Pass** — `sealOfflinePciField` returns `{ algorithm: "noop-v1", sealed: "" }` only when plaintext is empty |
| `no-btoa-plaintext-fallback` | **Pass** — `btoa(trimmed)` removed (P0-8); non-empty fields require AES-GCM |
| `web-crypto-gate-for-non-empty` | **Pass** — `assertOfflinePciEncryptionAvailable()` before sealing non-empty PCI-adjacent fields |
| `legacy-unseal-migration-read-only` | **Pass** — `OFFLINE_PCI_NOOP_V1_LEGACY_UNSEAL_ALLOWED = true`; migration read only, no new non-empty noop-v1 writes |
| `production-card-claims-blocked-until-qsa` | **Pass** — full QSA sign-off (R5) required before offline card sales claims |

## Retain vs remove

| Option | Verdict |
|--------|---------|
| **Remove noop-v1 entirely** | **Rejected** — empty-field sentinel still needed; would force aes-gcm round-trip for blank optional fields |
| **Retain noop-v1 empty-only** | **Accepted** — engineering review; pending external QSA counsel (R5 in `docs/offline-pos-pci-review.md`) |

## Code references

- `lib/pos/offline-pci-local-encryption.ts` — seal/unseal
- `lib/pos/offline-pci-noop-v1-review.ts` — static policy audit
- `docs/offline-pos-pci-review.md` — PCI scope review

## CI

```bash
npm run check:offline-pos-pci-noop-v1-p2-44
```

## Artifact

`artifacts/offline-pos-pci-noop-v1-p2-44.json`
