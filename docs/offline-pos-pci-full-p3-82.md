# Offline POS PCI — full review + AES-GCM QSA sign-off (P3-82)

**Policy:** `offline-pos-pci-full-p3-82-v1`  
**Date:** 2026-06-16  
**Owner:** Engineering + Compliance  
**Sign-off status:** `engineering_ready_pending_external_qsa`

Full PCI review for gap P3-82: AES-GCM device-local sealing path, upstream gates (P2-44 noop-v1, P1-35 E2E), and QSA sign-off artifact.

**Authority chain:** Supplements [`docs/offline-pos-pci-review.md`](./offline-pos-pci-review.md). noop-v1 decision: [`docs/offline-pos-pci-noop-v1-p2-44.md`](./offline-pos-pci-noop-v1-p2-44.md). E2E chain: [`docs/offline-pos-pci-flow-e2e-p1-35.md`](./offline-pos-pci-flow-e2e-p1-35.md). QSA counsel track: [`docs/pen-test-scheduling-p3-81.md`](./pen-test-scheduling-p3-81.md).

---

## Executive summary

| Dimension | Finding |
|-----------|---------|
| **Primary seal algorithm** | AES-GCM v1 (`aes-gcm-v1`) for all non-empty PCI-adjacent fields |
| **Key material** | 32-byte random key per browser profile in IndexedDB `kitchenos-offline-pci-keys` |
| **IV** | 12-byte random per seal operation |
| **Empty fields** | `noop-v1` empty sentinel only (P2-44 retain-empty-only) |
| **Insecure fallback** | **Removed** — no `btoa(trimmed)` plaintext seal |
| **Engineering review** | **Pass** — AES-GCM path verified in code + unit tests |
| **External QSA sign-off** | **Pending** — PCI counsel intro scheduled 2026-06-24 (P3-81) |
| **Production card claims** | **Blocked** until external QSA + pen test (R5/R6 in PCI review) |

**Safe headline:** "Device-local AES-GCM seals last4/brand in IndexedDB — engineering review complete, external QSA pending."

**Forbidden:** "PCI certified offline POS," "QSA signed off," "production-ready offline card."

---

## AES-GCM implementation review

| Item | Status |
|------|--------|
| `aes-gcm-v1-non-empty-seal` | **Pass** — `sealOfflinePciField` returns `{ algorithm: "aes-gcm-v1", sealed: "iv.cipher" }` for non-empty plaintext |
| `12-byte-random-iv` | **Pass** — `crypto.getRandomValues(new Uint8Array(12))` per seal |
| `32-byte-device-local-key` | **Pass** — `getRandomValues(new Uint8Array(32))` stored in IndexedDB |
| `indexeddb-key-isolation` | **Pass** — key scoped to `kitchenos-offline-pci-keys` / `offline-pci-v1` per browser profile |
| `no-plaintext-fallback` | **Pass** — `assertOfflinePciEncryptionAvailable()` blocks non-empty seal without Web Crypto |
| `noop-v1-empty-only-upstream-p2-44` | **Pass** — P2-44 gate `check:offline-pos-pci-noop-v1-p2-44` |
| `e2e-offline-aes-gcm-sync-upstream-p1-35` | **Pass** — chain `offline → aes_gcm → network → sync` (P1-35) |
| `production-card-claims-blocked-until-external-qsa` | **Pass** — sales registry + this artifact |

Code: `lib/pos/offline-pci-local-encryption.ts` → `sealOfflinePciField`, `unsealOfflinePciField`.

Unit proof: `tests/unit/offline-pos-pci-encryption.test.ts`, `tests/unit/offline-pos-pci-full-p3-82.test.ts`.

---

## QSA sign-off artifact

| Field | Value |
|-------|-------|
| Engineering review | **Passed** 2026-06-16 |
| External QSA counsel | **Pending** — intro 2026-06-24 |
| Pen test (IndexedDB extraction) | **Pending** — Cobalt kickoff 2026-07-07 |
| Offline card sales claims | **Blocked** |

Artifact: `artifacts/offline-pos-pci-full-p3-82.json`

---

## Upstream gates

| Gap | Gate | Status |
|-----|------|--------|
| P2-44 | noop-v1 retain-empty-only | **Pass** |
| P1-35 | offline → AES-GCM → network → sync E2E | **Pass** |
| P3-81 | QSA counsel + pen test scheduled | **Scheduled** |
| Task 39 | PCI scope review doc | **Pass** — cross-linked |

---

## CI

```bash
npm run check:offline-pos-pci-full-p3-82
```

## Artifact

`artifacts/offline-pos-pci-full-p3-82.json`
