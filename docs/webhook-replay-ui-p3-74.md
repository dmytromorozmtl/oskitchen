# Webhook replay/retry UI (P3-74)

**Policy:** `webhook-replay-ui-p3-74-v1`  
**Department:** Backend  
**Upstream:** `webhook-replay-ui-p1-37-v1`  
**Registry:** [`artifacts/webhook-replay-ui-p3-74-registry.json`](../artifacts/webhook-replay-ui-p3-74-registry.json)

---

## Operator surfaces

| Surface | Route | Capability |
|---------|-------|------------|
| Channel webhook center | `/dashboard/sales-channels/webhooks` | Per-event audited replay form |
| Legacy webhook log | `/dashboard/integrations/webhooks` | Same replay row |
| Platform DLQ | `/platform/webhooks` | Operator replay + invalid-signature override |
| Integration health (wave 2) | `/dashboard/integrations/health` | Failure snapshot → replay CTA |

Full audit rules: [`docs/WEBHOOK_REPLAY_WITH_AUDIT.md`](./WEBHOOK_REPLAY_WITH_AUDIT.md)

---

## Verify

```bash
npm run check:webhook-replay-ui
npm run check:webhook-replay-ui-p3-74
npm run audit:webhook-replay-ui-p3-74
npm run test:ci:webhook-replay-ui-p3-74:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` (P3-74 cert after upstream check)

---

## Status

Workspace + platform replay UI wired (P1-37). Integration health bridge surfaces webhook queue failures with deep link to replay tooling (P3-74 wave 2).
