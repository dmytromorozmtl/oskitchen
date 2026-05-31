# KDS Realtime — Sales One-Pager

**Status:** Preview — LIVE/POLLING UI shipped; SLO proof in progress on staging  
**Audience:** Sales, VP Operations, pilot kitchen leads  
**Technical:** [`kds-slo-proof-plan.md`](./kds-slo-proof-plan.md) · [`kds-websocket-implementation-plan.md`](./kds-websocket-implementation-plan.md)

---

## One-line pitch

**Sub-second kitchen tickets on Supabase Realtime — with an honest LIVE/POLLING badge and 15s safety net — inside a full restaurant OS, not a standalone KDS appliance.**

---

## What operators see today

| UI element | What it means |
|------------|---------------|
| **LIVE** badge (green pulse) | Supabase Realtime connected — tickets push in real time |
| **POLLING** badge (amber) | Fallback active — queue refreshes every 15s max |
| New ticket animation | Visual flash when order lands on the line |
| Sound alerts | New order chime + overdue alert (toggle in bar) |
| Queue strip | Active / Prep / Ready / Overdue counts + transport status |

**Route:** `/dashboard/kitchen` — daily-service KDS v1 (`KdsKitchenDailyClient`).

---

## SLO targets (LIVE transport — proof bar)

| Latency | Target | Status |
|---------|--------|--------|
| p50 order → ticket | **< 500ms** | Staging proof required |
| p95 | **< 2s** | Staging proof required |
| p99 | **< 5s** | Staging proof required |
| POLLING fallback p99 | **≤ 15s** | Unit-certified (`KDS_POLL_FALLBACK_MS`) |

**Honesty:** Say **"Realtime pilot with documented SLO proof plan"** — not "guaranteed sub-500ms" until 7-day histogram is green.

---

## Competitor comparison

| | Toast KDS | Square KDS | Fresh KDS | **OS Kitchen** |
|---|-----------|------------|-----------|----------------|
| Transport | Proprietary cloud | Square cloud | Third-party | **Supabase Realtime + poll fallback** |
| Offline behavior | Varies by hardware | Limited | Varies | **Honest POLLING badge (15s)** |
| Order source | Toast POS only | Square POS | Integrations | **Unified spine** (POS + Shopify + Woo + webhooks) |
| OS depth | POS-first | POS + payments | KDS-only | **Full kitchen OS** (inventory, B2B, integrations) |
| Transparency | Opaque sync | Opaque sync | Opaque sync | **LIVE/POLLING visible to staff** |

**Sales line:** *"Your line cooks see whether the board is truly live or on fallback — no black-box sync. Same unified order spine as your POS and delivery channels."*

---

## What works today (evidence)

| Capability | Evidence |
|------------|----------|
| Realtime hook + auto-reconnect | `hooks/use-kds-realtime.ts` |
| Transport abstraction | `services/kds-websocket.ts` |
| LIVE/POLLING sticky bar | `app/dashboard/kitchen/kds-kitchen-realtime-bar.tsx` |
| Ticket board + bump/recall | `components/kitchen/kds-daily-service.tsx` |
| Staging E2E (POS → ticket) | `e2e/kds-staging.spec.ts` |
| Realtime connection smoke | `e2e/kds-realtime-staging.spec.ts` |
| SLO proof plan | `docs/kds-slo-proof-plan.md` |
| Unit tests | `tests/unit/kds-slo-proof-plan-wiring.test.ts` |

---

## Safe sales wording

**Allowed (qualified):**

- "Daily-service KDS with bump/recall and **visible LIVE/POLLING status**"
- "Supabase Realtime with **15s polling fallback** — honest degraded mode"
- "Sub-2s p95 **target** on LIVE transport — staging proof in progress"

**Not allowed (until proof + pilot sign-off):**

- "Sub-500ms guaranteed"
- "Rush-hour certified"
- "Production Realtime SLO met"
- "Toast / Square KDS parity"
- "Always-on Realtime"

---

## ROI for operator

- **Fewer missed tickets:** Realtime push vs manual refresh on competitor boards
- **Staff trust:** LIVE badge removes "is this board frozen?" anxiety
- **Single spine:** Same order from POS, Shopify, DoorDash — one KDS queue
- **No KDS-only vendor:** KDS included in OS Kitchen — no per-screen SaaS tax

---

## Pilot proof path

### Engineering (pre-contract)

```bash
npm run test:ci:kds-realtime-smoke:cert
npm run test:ci:kds-v1:prototype:cert
```

### Staging operator (pre-go-live)

1. Complete [`kds-staging-smoke-checklist.md`](./kds-staging-smoke-checklist.md) Tier B–D
2. Run `playwright-kds-staging.yml` workflow — record GitHub run URL
3. Verify LIVE badge on staging during business hours
4. Track toward 7-day SLO histogram per [`kds-slo-proof-plan.md`](./kds-slo-proof-plan.md)

**Honest skip:** Without `E2E_STAGING_*` secrets → **SKIPPED WITH REASON** (not fake PASS).

---

## Next step for pilot

1. DevOps: confirm `NEXT_PUBLIC_SUPABASE_*` + `ENABLE_KDS_V1_CERTIFIED=true` on staging  
2. Operator walkthrough: bump/recall + sound toggle + LIVE badge  
3. Run staging Playwright proof → begin 7-day SLO collection  
4. Sign pilot readiness in [`kds-slo-proof-plan.md`](./kds-slo-proof-plan.md) checklist

---

## References

- [`kds-slo-proof-plan.md`](./kds-slo-proof-plan.md) — proof methodology
- [`kds-slo-definition.md`](./kds-slo-definition.md) — full-service SLO incl. fallback
- [`kds-qualified-sales-onepager-era17.md`](./kds-qualified-sales-onepager-era17.md) — Era 17 qualified pilot wording
- [`stripe-terminal-sales-one-pager.md`](./stripe-terminal-sales-one-pager.md) — companion hardware moat
