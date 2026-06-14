# P1-31 — Offline POS full mode (Toast parity) + PCI noop-v1 review

**Policy:** `offline-pos-full-mode-p1-31-v1`  
**Registry:** [`artifacts/offline-pos-full-mode-p1-31.json`](../artifacts/offline-pos-full-mode-p1-31.json)

## Contract

Offline POS **full mode** delivers Toast-parity register behavior in the browser:

1. **Menu cache** — POS products cached in IndexedDB when online; terminal loads cache on refresh while offline
2. **Local cart** — sessionStorage cart per register
3. **Cash offline** — checkout queue replays on reconnect
4. **PCI AES-GCM** — last4/brand sealed with aes-gcm-v1; card queue blocked without Web Crypto
5. **Auto-sync** — online event + 60s interval replay
6. **Conflict resolution** — duplicate/inventory/shift/plan classification
7. **noop-v1 review** — empty-field sentinel only; no insecure plaintext fallback

EMV store-and-forward remains **out of scope** — see [`offline-pos-pci-review.md`](./offline-pos-pci-review.md).

## noop-v1 fallback review

| Case | Algorithm | Allowed |
|------|-----------|---------|
| Empty last4/brand/pi | `noop-v1` + `sealed: ""` | Yes |
| Non-empty PCI-adjacent field | `aes-gcm-v1` | Required |
| Web Crypto unavailable + non-empty | — | Blocked (`OFFLINE_CARD_QUEUED` disabled) |
| Legacy blob unseal | `noop-v1` + non-empty sealed | Migration read only |

Code: `lib/pos/offline-pci-noop-v1-review.ts` · `lib/pos/offline-pci-local-encryption.ts`

## Verify

```bash
npm run check:offline-pos-full-mode-p1-31
```
