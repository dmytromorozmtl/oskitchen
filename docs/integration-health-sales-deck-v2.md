# Integration Health Scoring — Sales Deck v2 (June 2026)

**Status:** BETA — scoring engine + recovery playbooks shipped; live channel proof blocked until vault 11/11  
**Audience:** Sales, VP Operations, enterprise support leads  
**Supersedes:** [`integration-health-sales-deck.md`](./integration-health-sales-deck.md) (May 2026 preview)  
**Technical:** [`health-scoring-engine.ts`](../services/integration-health/health-scoring-engine.ts) · [`recovery-playbook-service.ts`](../services/integration-health/recovery-playbook-service.ts) · [`/dashboard/integrations/health`](../app/dashboard/integrations/health/page.tsx)

---

## June delta (v1 → v2)

| Area | May 31 (v1) | June 1 (v2) |
|------|-------------|-------------|
| Scoring engine | Preview, policy wired | **427 LOC shipped** — workspace rollup, 7d trends, 6 alert codes |
| Recovery playbooks | Listed as "next cycle" | **Shipped** — 6 alert→playbook maps, 3 auto actions, success-rate tracking |
| Auto recovery | Not available | `run_health_check`, `pull_inventory_sync`, `pull_cross_channel_sync` |
| Cross-channel tie-in | Mentioned in ROI | Playbooks call `cross-channel-inventory-sync` on stale sync alerts |
| Live proof | Pilot burn-in next | **Still blocked** — vault 0/11, 0 LIVE integrations in registry, pilot NO-GO |
| Sales claim ceiling | No fake green | Unchanged — **MOAT caveat**: score + playbook ≠ guaranteed uptime |

**Headline for June calls:** *"We don't just score the integration — we assign the recovery path and track whether auto-steps worked."*

---

## Slide 1 — One-line pitch

**0–100 integration health score, predictive alerts, and guided recovery playbooks — before orders stop flowing, not after the support ticket.**

---

## Slide 2 — The problem

| Pain | Cost |
|------|------|
| Silent webhook failures | Missed DoorDash/Shopify orders |
| Stale catalog sync | Oversells and 86 chaos |
| Credential drift | Weekend outage with no warning |
| Alert fatigue | Dashboard red with no next step |

**Buyer quote:** *"We didn't know Shopify was broken until Monday's reconciliation — and support had no runbook."*

---

## Slide 3 — OS Kitchen answer (June)

| Capability | What operators get |
|------------|-------------------|
| **0–100 score** | Per-connection + workspace rollup |
| **Trends** | Improving · stable · declining (7-day delta) |
| **Predictive alerts** | 6 codes: critical score, declining trend, stale sync, webhook failures, latency spike, auth degraded |
| **Recovery playbooks** | Auto + manual steps per alert; execution history + success rate |
| **Honest capability labels** | BETA / partner-required — no fake green |

**Routes:** `/dashboard/integrations/health` · `/dashboard/sales-channels` · `/dashboard/error-recovery`

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

Policy: `lib/integration-health/health-scoring-policy.ts` · Engine: `services/integration-health/health-scoring-engine.ts`

---

## Slide 5 — Alert → playbook mapping (June moat)

| Alert code | Auto steps | Manual steps | Success tracking |
|------------|------------|--------------|------------------|
| `score_critical` | Re-run health check | Credentials · webhook queue | Per connection, last 100 runs |
| `score_declining` | Baseline health check | Error recovery queue | Success rate % |
| `sync_stale` | Pull inventory · pull cross-channel | Product mapping | Auto action outcomes stored |
| `webhook_failures` | — | Webhook queue · safe replay | Execution audit in `settingsJson` |
| `latency_spike` | Re-test latency | Health history dashboard | Transient vs sustained triage |
| `auth_degraded` | Verify after re-auth | Re-authenticate channel | Post-credential health check |

Policy: `lib/integration-health/recovery-playbook-policy.ts` (`critical-integration-recovery-playbook-v1`)  
Service: `loadIntegrationRecoveryPlan()` in `recovery-playbook-service.ts`

**Sales line:** *"Every alert code has a playbook — not a PDF appendix."*

---

## Slide 5b — Five-hop recovery path

```
Alert fired → Playbook assigned → Auto step executed → Outcome recorded → Success rate updated
```

1. **Scoreboard** — `loadIntegrationHealthScoreboard(userId)` surfaces alerts  
2. **Assignment** — `getRecoveryPlaybookForAlert(code)` maps alert → steps  
3. **Auto execution** — health check, inventory pull, or cross-channel pull  
4. **Persistence** — outcomes stored on connection `settingsJson.integrationRecovery`  
5. **Triage** — `computeRecoverySuccessRate()` for support admin and pilot metrics  

This is the **5-hop recovery** referenced in the June forensic audit — wired in code, not slide fiction.

---

## Slide 6 — Competitor comparison

| | Middleware iPaaS | POS-native | **OS Kitchen (June)** |
|---|------------------|------------|------------------------|
| Score visibility | Per connector SKU | Opaque | **0–100 per channel + workspace** |
| Trend | Add-on analytics | None | **Built-in 7d delta** |
| Predictive | Rules engine extra | None | **6 alert codes** |
| Recovery | Ticket + external runbook | Phone support | **In-app playbooks + auto steps** |
| Kitchen context | None | POS-only | **Same spine as KDS + cross-channel inventory** |

---

## Slide 7 — Evidence (shipped June)

| Artifact | Path |
|----------|------|
| Scoring engine (427 LOC) | `services/integration-health/health-scoring-engine.ts` |
| Scoring policy | `lib/integration-health/health-scoring-policy.ts` |
| Recovery playbooks | `lib/integration-health/recovery-playbook-policy.ts` |
| Recovery service | `services/integration-health/recovery-playbook-service.ts` |
| Manual health checks | `actions/integration-health.ts` |
| Health dashboard | `app/dashboard/integrations/health/page.tsx` |
| Unit tests | `tests/unit/integration-health-scoring-engine.test.ts` |
| Recovery tests | `tests/unit/integration-health-recovery-playbook.test.ts` |

---

## Slide 8 — Safe sales wording (June)

**Allowed (qualified):**

- "Integration health scoring with 0–100 per channel — BETA, pilot path"
- "Predictive alerts for stale sync and webhook failures"
- "Guided recovery playbooks with auto health checks and inventory pulls"
- "Success-rate tracking for auto-recovery steps on pilot accounts"

**Not allowed (until vault + live smoke + pilot sign-off):**

- "Guaranteed zero downtime" or "100% webhook delivery SLA"
- "AI-powered root cause resolution" (playbooks are deterministic, not LLM)
- "SOC2-certified monitoring"
- "Fully autonomous self-healing" (manual steps remain for credentials and webhooks)
- "Production-proven across live channels" — **0 LIVE integrations in registry today**

---

## Slide 9 — ROI

- **Fewer missed orders:** Webhook failure alert + webhook queue playbook before service window
- **Less firefighting:** Declining score triggers auto health check + error recovery path
- **Faster enterprise deals:** Quantified health + recovery success rate vs competitor checkmarks
- **Single OS:** Health beside cross-channel inventory and KDS — no Datadog bolt-on for operators
- **Support efficiency:** Support admin can reference execution history instead of ad-hoc Slack threads

---

## Slide 10 — Pilot proof path

**Unit proof (available now):**

```bash
npm test -- tests/unit/integration-health-scoring-engine.test.ts
npm test -- tests/unit/integration-health-recovery-playbook.test.ts
```

**Staging proof (blocked until vault 11/11):**

1. Connect Shopify + Woo on staging with real credentials  
2. Run manual health checks on `/dashboard/integrations/health`  
3. Export scoreboard via `loadIntegrationHealthScoreboard(userId)`  
4. Trigger stale sync → verify `sync_stale` playbook assigns cross-channel pull  
5. Simulate webhook failures → verify manual webhook queue steps surface  
6. 7-day burn-in: workspace score ≥ 80, recovery success rate logged, zero unresolved critical alerts  

**Human gates:** See [`vault-one-pager.md`](./vault-one-pager.md) · [`cross-channel-staging-sync-plan.md`](./cross-channel-staging-sync-plan.md)

---

## References

- v1 deck: [`integration-health-sales-deck.md`](./integration-health-sales-deck.md)
- Forensic audit: [`fullreport1june.md`](./fullreport1june.md) § Integration Health Center
- [`cross-channel-inventory-sales-one-pager.md`](./cross-channel-inventory-sales-one-pager.md)
- [`INTEGRATIONS_ARCHITECTURE.md`](./INTEGRATIONS_ARCHITECTURE.md)
