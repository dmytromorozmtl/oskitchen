# Offline POS PCI flow E2E (P1-35)

**Policy:** `offline-pos-pci-flow-e2e-p1-35-v1`

Gap closure for QA task P1-35: prove the offline POS PCI chain end-to-end.

## Chain

```
offline → AES-GCM seal → queue transaction → network reconnect → sync drain
```

| Step | Implementation |
|------|----------------|
| `go_offline` | Playwright `context.setOffline(true)` on POS terminal |
| `aes_gcm_seal` | `sealOfflinePciField("4242")` → `aes-gcm-v1`; empty fields stay `noop-v1` |
| `queue_transaction` | Sale queued in IndexedDB (`kitchenos-offline-pos`) |
| `reconnect_online` | `context.setOffline(false)` |
| `sync_drain` | Queue drains; checkout status shows sync success |

## Files

- Policy: `lib/qa/offline-pos-pci-flow-e2e-p1-35-policy.ts`
- Audit: `lib/qa/offline-pos-pci-flow-e2e-p1-35-audit.ts`
- E2E spec: `e2e/offline-pos-pci-flow.spec.ts`
- Scoring: `lib/qa/offline-pos-pci-flow-e2e-scoring.ts`
- Encryption: `lib/pos/offline-pci-local-encryption.ts`

## CI

```bash
npm run check:offline-pos-pci-flow-p1-35
```

Live Playwright (requires credentials + flag):

```bash
E2E_OFFLINE_POS_PCI_FLOW=true E2E_LOGIN_EMAIL=... E2E_LOGIN_PASSWORD=... \
  npm run test:e2e:offline-pos-pci-flow
```

## Artifact

`artifacts/offline-pos-pci-flow-e2e-p1-35.json`
