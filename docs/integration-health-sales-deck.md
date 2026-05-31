# Integration Health Scoring — Sales Deck

**Status:** Preview — scoring engine shipped; pilot burn-in next  
**Audience:** Sales, VP Operations, enterprise support leads  
**Technical:** [`health-scoring-engine.ts`](../services/integration-health/health-scoring-engine.ts) · [`/dashboard/integrations/health`](../app/dashboard/integrations/health/page.tsx)

---

## Slide 1 — One-line pitch

**0–100 integration health score with trend detection and predictive alerts — before orders stop flowing, not after the support ticket.**

---

## Slide 2 — The problem

| Pain | Cost |
|------|------|
| Silent webhook failures | Missed DoorDash/Shopify orders |
| Stale catalog sync | Oversells and 86 chaos |
| Credential drift | Weekend outage with no warning |
| Opaque middleware | "Integration green" that isn't |

**Buyer quote:** *"We didn't know Shopify was broken until Monday's reconciliation."*

---

## Slide 3 — OS Kitchen answer

| Capability | What operators get |
|------------|-------------------|
| **0–100 score** | Per-connection + workspace rollup |
| **Trends** | Improving · stable · declining (7-day delta) |
| **Predictive alerts** | Stale sync, webhook failures, latency spikes, auth drift |
| **Honest capability labels** | BETA / partner-required — no fake green |

**Route:** `/dashboard/integrations/health` + `loadIntegrationHealthScoreboard()`

---

## Slide 4 — Scoring model (transparent)

| Signal | Weight impact |
|--------|---------------|
| Connection CONNECTED | +15 |
| Last health check OK | +20 |
| Recent sync (< 6h) | +10 |
| Low latency (< 500ms) | +5 |
| ERROR / NEEDS_AUTH | −25 to −35 |
| Sync stale (> 24h) | −15 + alert |
| Webhook fail rate > 15% | −20 + critical alert |

**Bands:** Healthy ≥ 80 · Watch 55–79 · Critical < 55

Policy: `lib/integration-health/health-scoring-policy.ts`

---

## Slide 5 — Predictive alerts (moat)

| Alert code | Triggers when | Severity |
|------------|---------------|----------|
| `score_critical` | Score < 55 | Critical |
| `score_declining` | 7d trend down ≥ 8 pts | Warning |
| `sync_stale` | Last sync > 24h | Warning |
| `webhook_failures` | 7d fail rate > 15% | Critical |
| `latency_spike` | Health check > 2s | Warning |
| `auth_degraded` | NEEDS_AUTH / missing creds | Warning |

**Sales line:** *"Your ops team sees the slide before the channel goes red — not a post-mortem spreadsheet."*

---

## Slide 6 — Competitor comparison

| | Middleware iPaaS | POS-native | **OS Kitchen** |
|---|------------------|------------|----------------|
| Score visibility | Per connector SKU | Opaque | **0–100 per channel + workspace** |
| Trend | Add-on analytics | None | **Built-in 7d delta** |
| Predictive | Rules engine extra | None | **Stale sync + webhook alerts** |
| Kitchen context | None | POS-only | **Same spine as KDS + inventory** |

---

## Slide 7 — Evidence (shipped)

| Artifact | Path |
|----------|------|
| Scoring engine | `services/integration-health/health-scoring-engine.ts` |
| Policy constants | `lib/integration-health/health-scoring-policy.ts` |
| Manual health checks | `actions/integration-health.ts` |
| Health dashboard | `app/dashboard/integrations/health/page.tsx` |
| Unit tests | `tests/unit/integration-health-scoring-engine.test.ts` |

---

## Slide 8 — Safe sales wording

**Allowed (qualified):**

- "Integration health scoring with 0–100 per channel — pilot path"
- "Predictive alerts for stale sync and webhook failures"
- "Trend detection for declining integrations before outage"

**Not allowed (until pilot sign-off):**

- "Guaranteed zero downtime"
- "AI-powered root cause resolution" (recovery playbooks = Cycle 11)
- "SOC2-certified monitoring"
- "100% webhook delivery SLA"

---

## Slide 9 — ROI

- **Fewer missed orders:** Webhook failure alert before service window
- **Less firefighting:** Declining score triggers proactive re-auth
- **Faster enterprise deals:** Quantified health vs competitor checkmarks
- **Single OS:** Health beside cross-channel inventory and KDS — no Datadog bolt-on for operators

---

## Slide 10 — Pilot proof path

```bash
npm test -- tests/unit/integration-health-scoring-engine.test.ts
```

1. Connect Shopify + Woo on staging  
2. Run manual health checks on `/dashboard/integrations/health`  
3. Export scoreboard via `loadIntegrationHealthScoreboard(userId)`  
4. Simulate webhook failures → verify alert codes  
5. 7-day burn-in: workspace score ≥ 80 with zero critical alerts  

**Next cycle:** Recovery playbooks (`recovery-playbook-service.ts`) link alert codes to auto + manual steps with success tracking.

---

## References

- [`cross-channel-inventory-sales-one-pager.md`](./cross-channel-inventory-sales-one-pager.md)
- [`kds-sales-one-pager.md`](./kds-sales-one-pager.md)
- [`INTEGRATIONS_ARCHITECTURE.md`](./INTEGRATIONS_ARCHITECTURE.md)
