# Integration honesty — screen-share guide

**Policy:** `integration-honesty-screen-share-mkt27-v1`  
**Updated:** 2026-06-03  
**Audience:** Founder, AE, solutions — live demos, objection O5, competitive deals  
**Duration:** ~6 minutes (seven segments)  
**Honesty:** [`forbidden-claims-training.md`](./forbidden-claims-training.md) · [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) · [`competitor-comparison-honest.md`](./competitor-comparison-honest.md)

**Constitution:** PASS > SKIPPED > FAIL. **Never** hide BETA / SKIPPED / PLACEHOLDER rows during screen-share. Green configured ≠ smoke-certified LIVE.

OS Kitchen has **0 LIVE third-party integrations** and **0 signed founding customers** (June 2026). Integration Health is our **honesty moat** — only if reps leave banners visible.

Technical routes: [`/dashboard/integration-health`](../app/dashboard/integration-health/page.tsx) · [`/dashboard/sales-channels`](../app/dashboard/sales-channels/available/page.tsx) · [`/trust`](../app/trust/page.tsx)

---

## When to screen-share

| Moment | Segment focus |
|--------|---------------|
| Objection O5 — "Integrations aren't live / SKIPPED" | S1 frame → S5 SKIPPED row |
| Demo segment 4 ([`demo-script-15min.md`](./demo-script-15min.md)) | S1–S7 full walkthrough |
| Competitive deal (BC4 Deliverect, BC5 Shopify) | S4 BETA + S6 PLACEHOLDER |
| Technical validator on call | S3 full matrix + smoke artifact viewer |
| Post-webinar follow-up | S2 Today strip + `/trust` |

**Do not** screen-share Integration Health without S1 framing — prospects assume green tiles mean LIVE.

---

## Label vocabulary (PASS / BETA / SKIPPED / PLACEHOLDER / FAILED)

Source: [`lib/integrations/integration-honesty.ts`](../lib/integrations/integration-honesty.ts) · [`feature-maturity-matrix.md`](./feature-maturity-matrix.md)

| Label | Meaning | Say on screen-share |
|-------|---------|---------------------|
| **PASS** | Staging smoke artifact captured for this integration scope | "Smoke passed in our CI/staging proof — not your production credentials yet" |
| **BETA** | Shipped wiring; pilot-ready with qualified scope | "Works in design-partner staging — not market-certified" |
| **SKIPPED** | Smoke not run or vault credential missing | "Intentionally honest — we haven't faked PASS" |
| **PLACEHOLDER** | Partner-gated marketplace (DoorDash, Uber Eats, Uber Direct) | "UI exists; no live connector — partner approval required" |
| **FAILED** | Smoke ran and failed — needs engineering triage | "We show red honestly — recovery playbook linked" |

**Never equate:** configured credentials = LIVE · green tile = PASS · BETA = production-certified.

---

## Seven screen-share segments

Total ~390 seconds. Policy: [`integration-honesty-screen-share-policy.ts`](../lib/marketing/integration-honesty-screen-share-policy.ts)

### S1 — Frame honesty before sharing (45 sec)

**Route:** None — talk track only

**Script:**

> "Before I open Integration Health — our rule is **PASS, BETA, and SKIPPED mean what they say**. We're pre-revenue with zero LIVE third-party integrations in production. I'd rather you see SKIPPED in minute seven than discover it in week seven. I'll pause on yellow and gray rows — don't ask me to scroll past them."

**Do not say:** "Everything is live" · "All channels connected"

---

### S2 — Today Integration Health strip (60 sec)

**Route:** [`/dashboard/today`](../app/dashboard/today/page.tsx)

**Script:**

> "On **Today**, the Integration Health strip is the owner-facing summary — same labels as the full matrix. If anything needs attention before service, it surfaces here first."

**Show:**

1. Today command center loads  
2. Integration Health strip visible (do not collapse)  
3. Point to worst-status row if present  

---

### S3 — Full integration health matrix (90 sec)

**Route:** [`/dashboard/integration-health`](../app/dashboard/integration-health/page.tsx)

**Script:**

> "Full matrix — every connector with maturity tier, last sync, webhook status, and smoke artifact when captured. This is what technical buyers should validate before contract."

**Show:**

1. P0 trust banner — leave visible  
2. Channel cards or maturity table  
3. Smoke artifact viewer if technical reviewer present  
4. Optional: recovery playbook link on one alert row  

**Do not:** Zoom past SKIPPED rows · collapse P0 banner · filter to "green only"

---

### S4 — Pause on BETA row (45 sec)

**Route:** Stay on `/dashboard/integration-health` or `/dashboard/sales-channels`

**Script:**

> "**BETA** means shipped wiring for design partners — Woo, Shopify, storefront, QR guest ordering fit here. We qualify scope in pilot SOW; we don't claim Toast-class marketplace ops."

**Show:**

1. One BETA row — read label aloud  
2. Recovery / setup link if configured  
3. Cross-check [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) if asked  

**Example rows:** WooCommerce · Shopify · storefront · Owner Daily Briefing

---

### S5 — Pause on SKIPPED row + recovery (60 sec)

**Route:** `/dashboard/integration-health`

**Script:**

> "**SKIPPED** is intentional — staging smoke not run or vault secret missing. Competitors don't need this UI because they're incumbent. We show it so your week-three validation matches our week-one demo."

**Show:**

1. One SKIPPED row — pause 5+ seconds  
2. Recovery playbook or "run smoke when credentialed" next action  
3. Link to [`/trust`](../app/trust/page.tsx) BETA/SKIPPED explanation  

**Pairs with:** Objection O5 in [`objection-handling.md`](./objection-handling.md)

---

### S6 — Marketplace placeholder row (45 sec)

**Route:** `/dashboard/integration-health` or `/dashboard/sales-channels/available`

**Script:**

> "**PLACEHOLDER** — DoorDash, Uber Eats, Grubhub, Uber Direct — partner-gated. We won't claim Deliverect parity or official aggregator partnership. Many operators run middleware **with** an ops OS underneath."

**Show:**

1. Placeholder badge on channel card ([`channel-card.tsx`](../components/channels/channel-card.tsx))  
2. No fake health score on placeholder providers  

**Pairs with:** BC4 in [`competitive-battle-cards.md`](./competitive-battle-cards.md)

---

### S7 — Trust page + next step (45 sec)

**Route:** [`/trust`](../app/trust/page.tsx) (public — safe to open in same tab)

**Script:**

> "Public **Trust** page explains BETA, PREVIEW, and SKIPPED for procurement reviewers. Next step: design-partner LOI or scoped pilot — we re-run GO/NO-GO when your credentials allow live smoke."

**CTA:** [`/book-demo?utm_source=integration-honesty&utm_medium=screen-share&utm_campaign=integration-honesty-mkt27`](/book-demo?utm_source=integration-honesty&utm_medium=screen-share&utm_campaign=integration-honesty-mkt27)

---

## Pre-share checklist

- [ ] Staging workspace loaded — not production with fake green  
- [ ] Browser 100% zoom · DND · screen-share audio tested  
- [ ] S1 framing script memorized — do not skip  
- [ ] P0 / trust banners **not** dismissed  
- [ ] Know which rows are BETA vs SKIPPED vs PLACEHOLDER in this tenant  
- [ ] [`forbidden-claims-training.md`](./forbidden-claims-training.md) certification current  
- [ ] Technical reviewer? — open smoke artifact viewer (S3)  
- [ ] Competitive incumbent noted — open matching battle card (BC4/BC5)  

---

## Forbidden screen-share claims

**Never** say while sharing Integration Health:

- Everything is live / all integrations are live / all channels live  
- Uber Eats or DoorDash official partner  
- Hide SKIPPED or "don't worry about the yellow rows"  
- Production certified for all tenants  
- Guaranteed uptime / five nines  
- Woo/Shopify certified while artifact shows SKIPPED  

Lint: `lintIntegrationHonestyScreenShareCopy` in [`integration-honesty-screen-share-policy.ts`](../lib/marketing/integration-honesty-screen-share-policy.ts).

Run `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` before recording demo videos.

---

## Post-share checklist

- [ ] Prospect acknowledged SKIPPED/BETA labels (CRM: `integration_honesty_ack=yes`)  
- [ ] Follow-up email attaches [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) — not "all live" summary  
- [ ] If LOI track — [`pilot-proposal-template.md`](./pilot-proposal-template.md) lists honest module scope  
- [ ] Log which segments shown (S1–S7)  
- [ ] Forbidden claims scan PASS on follow-up copy  
- [ ] Re-run GO/NO-GO only after customer credentials — never fake PASS  

---

## CRM fields

| Field | Example |
|-------|---------|
| `integration_honesty_screen_share` | yes |
| `segments_shown` | S1,S3,S4,S5,S7 |
| `skipped_row_acknowledged` | yes |
| `technical_reviewer_present` | yes |
| `incumbent_stack` | Toast + Deliverect |
| `next_step` | LOI · pilot SOW · nurture |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`demo-script-15min.md`](./demo-script-15min.md) | Segment 4 Integration Health (2 min) |
| [`integration-health-sales-deck-v2.md`](./integration-health-sales-deck-v2.md) | Scoring + recovery playbooks depth |
| [`objection-handling.md`](./objection-handling.md) | O5 integrations SKIPPED |
| [`competitive-battle-cards.md`](./competitive-battle-cards.md) | BC4 Deliverect · BC5 Shopify |
| [`woocommerce-live-smoke-setup.md`](./woocommerce-live-smoke-setup.md) | When SKIPPED → PASS path |
| [`shopify-live-smoke-setup.md`](./shopify-live-smoke-setup.md) | When SKIPPED → PASS path |

**Primary CTA:** [`/book-demo?utm_source=integration-honesty&utm_medium=screen-share&utm_campaign=integration-honesty-mkt27`](/book-demo?utm_source=integration-honesty&utm_medium=screen-share&utm_campaign=integration-honesty-mkt27)
