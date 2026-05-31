# Competitor Tracker Reconciliation

**Date:** 2026-05-31  
**Artifacts:** `artifacts/competitor-feature-tracker.json` · `artifacts/competitor-audit-report.md`  
**Audience:** Product, GTM, VP Operations, Engineering

---

## The gap (headline)

| Lens | Done | Total | Meaning of "done" |
|------|------|-------|-------------------|
| **Internal tracker** | **57/57** | 57 keys | Engineering shipped code, RFC phase, or wiring artifact |
| **Sales-safe audit** | **1/25** | 25 competitor features | Customer-ready with tests, live proof, no material caveats |
| **Audit breakdown** | — | 25 | 1 YES · 22 PARTIAL · 2 PLACEHOLDER · 0 MISSING |

The tracker is an **engineering delivery ledger**. The audit is a **sales-safe truth table**. Both can be correct at the same time.

---

## Why they diverge

### 1. Different definitions of "done"

| Tracker `done` means | Sales-safe **YES** means |
|----------------------|--------------------------|
| Code path exists under expected (or documented alternate) paths | Meaningful tests **and** no material sales caveats |
| RFC phase shipped in repo | Live smoke PASS or honest FAIL with credentials |
| Unit tests green | Browser E2E or staging proof where claim requires it |
| Artifact file exists (even `overall: SKIPPED`) | Registry maturity matches claim (BETA ≠ LIVE) |

**Example:** `live-smoke-woocommerce: done` in tracker = script + artifact exist. Audit = **PLACEHOLDER** because artifact says `overall: SKIPPED` (vault empty).

### 2. Phase granularity (57 keys vs 25 features)

The tracker counts **25 top-level competitor keys** plus **32 sub-phase keys** (Shopify Markets phases, app marketplace phases, restaurant capital phases). Sales collateral speaks in **25 competitor-parity features** grouped by category (Delivery, POS, Table Service, etc.).

Historical references to **96 keys** included phase keys plus `*ShippedAt` metadata timestamps from earlier gap-closure cycles. Current tracker file: **57 status keys** + metadata block.

### 3. Agent optimism vs procurement scrutiny

Gap-closure cycles mark phases `done` when code merges. The May 31 forensic audit re-reads paths, E2E gates, registry status, and `page-maturity-honesty.ts` before scoring.

---

## Mapping: 57 tracker keys → 25 sales-safe features

### Delivery marketplace (5 sales features)

| Sales-safe feature | Tracker keys | Tracker | Audit |
|--------------------|--------------|---------|-------|
| DoorDash ingest | `doordash-ingest` | done | PARTIAL |
| Uber Eats ingest | `uber-eats-ingest` | done | PARTIAL |
| Grubhub ingest | `grubhub-ingest` | done | PARTIAL |
| Menu sync → marketplaces | *(no dedicated key)* | — | PARTIAL |
| Unified delivery analytics | `delivery-analytics-unified` | done | PARTIAL |

### POS & offline (1)

| Sales-safe feature | Tracker keys | Tracker | Audit |
|--------------------|--------------|---------|-------|
| Offline mode default | `offline-mode-default` | done | PARTIAL |

### Table service (4)

| Sales-safe feature | Tracker keys | Tracker | Audit |
|--------------------|--------------|---------|-------|
| Floor plan editor | `floor-plan-editor` | done | PARTIAL |
| Real-time table occupancy | *(no key — refresh-only)* | — | PARTIAL |
| Handheld ordering | `handheld-ordering` | done | PARTIAL |
| Complete bill splitting | `bill-splitting-complete` | done | **YES** |

### Multi-location (2)

| Sales-safe feature | Tracker keys | Tracker | Audit |
|--------------------|--------------|---------|-------|
| Multi-location dashboard | `multi-location-dashboard` | done | PARTIAL |
| Advanced reporting | `advanced-reporting` | done | PARTIAL |

### Workforce (4)

| Sales-safe feature | Tracker keys | Tracker | Audit |
|--------------------|--------------|---------|-------|
| AI scheduling | `ai-scheduling` | done | PARTIAL |
| Tip pooling | `tip-pooling` | done | PARTIAL |
| Labor cost % realtime | `labor-cost-realtime` | done | PARTIAL |
| Team communication | `team-communication` | done | PARTIAL |

### E-commerce (4)

| Sales-safe feature | Tracker keys | Tracker | Audit |
|--------------------|--------------|---------|-------|
| Live smoke Woo/Shopify | `live-smoke-woocommerce`, `live-smoke-shopify`, `live-smoke-combined` | done (×3) | PLACEHOLDER |
| Bidirectional inventory sync | `bidirectional-inventory-sync` | done | PARTIAL |
| Shopify Markets | `shopify-markets-rfc` + phases 1–19, bidirectional, catalog, tax-duty | done (×22) | PARTIAL |
| WooCommerce Subscriptions | `woocommerce-subscriptions-rfc` | done | PLACEHOLDER |

### Reservations (2)

| Sales-safe feature | Tracker keys | Tracker | Audit |
|--------------------|--------------|---------|-------|
| Reservation system | `reservations-system` | done | PARTIAL |
| Waitlist + SMS | `waitlist-management` | done | PARTIAL |

### Loyalty & marketplace (3)

| Sales-safe feature | Tracker keys | Tracker | Audit |
|--------------------|--------------|---------|-------|
| Restaurant loyalty | `restaurant-loyalty` | done | PARTIAL |
| App marketplace | `app-marketplace-rfc` + phases 1–7 | done (×8) | PARTIAL |
| Restaurant capital | `restaurant-capital-rfc` + phases 2–6, resources-hub | done (×7) | PARTIAL |

**Roll-up:** 25 top-level keys + 32 phase keys = **57 tracker entries**, all `done`. Sales-safe: **1 YES**, **22 PARTIAL**, **2 PLACEHOLDER**.

---

## Tracker keys that inflate "done" without sales lift

| Key pattern | Why tracker marks done | Why audit downgrades |
|-------------|------------------------|----------------------|
| `live-smoke-*` | Script + JSON artifact on disk | Artifact `SKIPPED` — no staging creds |
| `*-rfc` | RFC + scaffold merged | Product not shippable (Woo Subscriptions) or BETA only |
| `shopify-markets-phase*` | Each B2B phase code-merged | Flag-gated; live tenant unproven |
| `app-marketplace-phase*` | Extensions catalog phases | UI says "not self-serve OAuth app store yet" |

---

## Recommendation: rebuild tracker on sales-safe criteria

### Proposed status enum (replace binary `done`)

| Status | Definition | Maps to audit |
|--------|------------|---------------|
| `shipped` | Code in main; unit tests | PARTIAL or YES |
| `beta` | Registry BETA + honesty banner | PARTIAL |
| `live_proven` | Live smoke PASS artifact | YES (when no caveats) |
| `blocked` | Waiting on vault / creds | PLACEHOLDER |
| `rfc_only` | Doc without product | PLACEHOLDER / MISSING |

### Immediate actions

1. **GTM:** Use `artifacts/competitor-audit-report.md` for external claims — not raw tracker counts.
2. **Product:** Add `salesSafeVerdict` field per top-level key (sync from audit table).
3. **Eng:** Do not mark `live-smoke-*` `live_proven` until `npm run smoke:*-live -- --execute` → PASS.
4. **Ops:** Vault 11/11 unblocks live smoke re-run — largest single uplift for audit score.

---

## Quick reference: audit vs tracker (top-level keys)

| Tracker key | Tracker | Audit verdict |
|-------------|---------|---------------|
| `doordash-ingest` / `uber-eats-ingest` / `grubhub-ingest` | done | PARTIAL |
| `delivery-analytics-unified` | done | PARTIAL |
| `offline-mode-default` | done | PARTIAL |
| `floor-plan-editor` | done | PARTIAL |
| `handheld-ordering` | done | PARTIAL |
| `bill-splitting-complete` | done | **YES** |
| `multi-location-dashboard` | done | PARTIAL |
| `advanced-reporting` | done | PARTIAL |
| `live-smoke-*` (×3) | done | PLACEHOLDER |
| `woocommerce-subscriptions-rfc` | done | PLACEHOLDER |
| `shopify-markets-rfc` (+ phases) | done | PARTIAL |
| All other top-level keys | done | PARTIAL |

---

## References

- Forensic audit: `artifacts/competitor-audit-report.md`
- Engineering tracker: `artifacts/competitor-feature-tracker.json`
- Integration maturity: `lib/integrations/integration-registry.ts`
- Page honesty: `lib/navigation/page-maturity-honesty.ts`
- Vault blocker: `docs/vault-one-pager.md`
