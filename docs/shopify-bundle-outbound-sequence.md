# Shopify Bundle — Outbound Sequence

**Status:** Ready for prospecting — live demo blocked until vault 11/11 + staging smoke  
**Audience:** SDR, AE, founder-led sales  
**Assets:** [`/shopify`](../app/shopify/page.tsx) · [`shopify-bundle-sales-guide.md`](./shopify-bundle-sales-guide.md) · [`integration-health-sales-deck-v2.md`](./integration-health-sales-deck-v2.md)

---

## Goal

Book **qualified discovery calls** with Shopify-first food operators who need kitchen ops behind their storefront — not generic POS replacements.

**Success metric (Week 1 outbound):** 20 touches → 5 replies → 2 qualified demos scheduled.

---

## ICP filter (qualify before Touch 1)

| Signal | Include | Exclude |
|--------|---------|---------|
| Platform | Shopify store (meal prep, catering, ghost kitchen, hybrid retail+food) | Woo-only, Square-only, no ecommerce |
| Pain | Manual order copy, inventory drift, separate kitchen POS | Happy with Shopify POS + no production |
| Size | 50–500 orders/week online + kitchen | Pure retail, no food production |
| Wholesale | Shopify Plus / B2B Markets interest | B2C-only with no wholesale plans |
| Honesty fit | Accepts custom app (beta) posture | Requires App Store listing today |

**Disqualify fast:** "We need Shopify App Store OAuth today" · "Replace Shopify checkout" · "Guaranteed real-time sync SLA"

---

## Sequence overview (14 days, 7 touches)

| Day | Channel | Asset | CTA |
|-----|---------|-------|-----|
| 0 | LinkedIn connect | — | No pitch in connect note |
| 1 | Email 1 | `/shopify` hero line | Reply "kitchen" |
| 3 | LinkedIn DM | Pain point #1 (checkout ≠ kitchen) | Link `/shopify` |
| 5 | Email 2 | Comparison table snippet | 15-min fit call |
| 8 | Call / voicemail | 30-sec pitch from sales guide | Book demo |
| 10 | Email 3 | Case angle (composite testimonial) | Pilot conversation |
| 14 | Break-up email | Honest beta scope | Archive or nurture |

**CRM stage mapping:** `prospect` → `contacted` → `replied` → `qualified` → `demo_scheduled` → `pilot_candidate`

---

## Touch 1 — Email (Day 1)

**Subject:** Shopify checkout — who runs your kitchen?

**Body:**

> Hi {{first_name}},
>
> Most {{segment}} brands I talk to keep Shopify for online sales — but production, KDS, and inventory still live in spreadsheets or a second POS.
>
> We built a bundle that ingests Shopify orders into the same Order Hub as counter sales, with cross-channel inventory sync and an honest custom-app setup (beta — not App Store listed yet).
>
> Worth a 15-minute fit check? Reply **kitchen** or see the one-pager: {{base_url}}/shopify
>
> — {{sender}}

**Personalization tokens:** `segment` = meal prep | catering | ghost kitchen | hybrid retail+food

---

## Touch 2 — LinkedIn DM (Day 3)

> {{first_name}} — saw you're on Shopify for {{brand_hook}}. Quick question: when an online order comes in, does it hit your kitchen screen automatically or through a manual step?
>
> We connect Shopify webhooks to production/KDS without replacing checkout. Happy to share how operators avoid inventory drift: {{base_url}}/shopify

---

## Touch 3 — Email (Day 5)

**Subject:** Shopify POS vs kitchen spine

**Body:**

> {{first_name}},
>
> Three things our Shopify bundle covers that POS alone usually doesn't:
>
> 1. **Order Hub** — Shopify orders beside counter sales  
> 2. **Cross-channel inventory** — conflict queue + health dashboard  
> 3. **Optional B2B AR** — aging/credit when Markets wholesale is in scope  
>
> Comparison table on the landing page. If any of these are active pain, I can walk a 10-minute demo flow (connect → Order Hub → inventory).
>
> {{calendar_link}}

---

## Touch 4 — Call script (Day 8)

**Opener (30 sec):**

> "This is {{name}} from OS Kitchen. We help Shopify food brands run kitchen production and inventory on one spine — you keep Shopify checkout. Is now a bad time for 30 seconds?"

**If yes — discovery (3 questions):**

1. "Where do Shopify orders go after checkout — spreadsheet, separate POS, or kitchen screen?"
2. "How often does online inventory disagree with what the kitchen actually has?"
3. "Any wholesale/B2B on Shopify Plus or Markets?"

**Bridge:**

> "We connect via custom app webhooks — orders promote to Order Hub, inventory syncs with conflict alerts. Not App Store listed yet; we're honest about beta scope."

**Close:**

> "I can show connect → Order Hub → cross-channel inventory in 10 minutes. Does {{day}} work?"

---

## Touch 5 — Email (Day 10)

**Subject:** What meal prep operators told us (pilot feedback)

**Body:**

> {{first_name}},
>
> Early Shopify integrations surfaced a consistent win: *"We kept Shopify for online sales but stopped copying orders into a second system."*
>
> That's the bundle pitch — same production spine as POS, with inventory health alerts before oversells.
>
> If you're evaluating kitchen ops behind Shopify this quarter, happy to compare notes on pilot scope (custom app, staging proof first).
>
> — {{sender}}

**Note:** Composite testimonial only — do not name prospects without signed reference.

---

## Touch 6 — Break-up (Day 14)

**Subject:** Closing the loop

**Body:**

> {{first_name}},
>
> I'll assume timing isn't right. If Shopify + kitchen ops becomes a priority later, the landing page stays at {{base_url}}/shopify and we're transparent about custom app beta + staging proof requirements.
>
> Reply anytime if you want back on the calendar.

---

## Demo handoff (AE)

When prospect replies or books:

1. **Pre-demo checklist**
   - Confirm ICP (Shopify + kitchen production)
   - Set expectation: custom app beta, not App Store
   - Staging demo only until vault 11/11 — label SKIPPED sections honestly

2. **10-minute demo flow** (from sales guide)
   - `/shopify` → `/dashboard/integrations/shopify` → Order Hub → cross-channel inventory → product mapping
   - Optional: receivables if `SHOPIFY_MARKETS_B2B_AR_DASHBOARD` enabled

3. **Post-demo**
   - Send sales guide PDF/link
   - Log: orders/week, inventory pain (1–5), wholesale Y/N
   - Route to pilot Week 1 template when LOI path opens

---

## CRM fields to capture

| Field | Values |
|-------|--------|
| `shopify_plan` | Basic / Shopify / Plus / unknown |
| `segment` | meal_prep / catering / ghost_kitchen / hybrid |
| `orders_per_week_online` | number |
| `inventory_pain` | none / occasional / weekly / daily |
| `wholesale_interest` | yes / no / later |
| `outbound_sequence` | shopify-bundle-v1 |
| `touch_count` | 0–7 |
| `demo_status` | not_offered / scheduled / completed / skipped_no_staging |

---

## Safe outbound wording

**Use:**

- "Shopify order ingest via signed webhooks"
- "Custom app integration (beta)"
- "Cross-channel inventory with health dashboard"
- "Same Order Hub as POS and catering"

**Avoid:**

- "Shopify App Store approved"
- "One-click OAuth install"
- "Real-time guaranteed sync"
- "Production-ready platform" (pilot NO-GO until staging proof)

---

## Blockers (human gates)

| Gate | Impact on outbound |
|------|-------------------|
| Vault 0/11 | Live smoke demo sections = SKIPPED; show unit-tested flows + landing |
| Pilot NO-GO | No "customer live" claims; offer design-partner / pilot conversation |
| 0 LIVE integrations | Say "staging proof path" not "production-proven across live channels" |

**When vault 11/11:** Re-run `npm run smoke:shopify-live` and upgrade demo script to live order ingest proof.

---

## References

- [`shopify-bundle-sales-guide.md`](./shopify-bundle-sales-guide.md)
- [`shopify-credentials-guide.md`](./shopify-credentials-guide.md)
- [`cross-channel-staging-sync-plan.md`](./cross-channel-staging-sync-plan.md)
- [`SHOPIFY_APP_MARKETPLACE_READINESS.md`](./SHOPIFY_APP_MARKETPLACE_READINESS.md)
