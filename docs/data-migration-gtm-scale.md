# Data Migration Wizard — GTM & Sales Scale Playbook

<!-- pm-gtm: absolute-final-pm-marketing-full-scale-v1 task-136 feature-91 -->

> **pm-gtm-hero-banner** · Toast / Square / Lightspeed switchers — **CSV export** path, **not live API**
>
> Wizard maps sample rows to OS Kitchen fields — **manual review** before production import. Live POS API migration remains **BETA**. Do **not** claim one-click automated migration or certified competitor API parity.
>
> **pm-gtm-dark-mode-note:** Plain markdown — readable in GitHub light and dark themes.

**Policy:** `data-migration-gtm-scale-absolute-final-v1`  
**Product surface:** [`/dashboard/import-center/migrate`](/dashboard/import-center/migrate) · [`components/import/migration-wizard-client.tsx`](../components/import/migration-wizard-client.tsx) · `data-migration-wizard-absolute-final-v1`  
**Related:** [`/dashboard/import-center`](/dashboard/import-center) · [`objection-handling.md`](./objection-handling.md) · [`/trust`](/trust)

---

## pm-gtm-icp-profile

### Ideal buyer

| Attribute | Fit |
|-----------|-----|
| Model | Single-location or ≤5-location operator switching from Toast, Square, or Lightspeed |
| Pain | Needs menu + customer CSV path before pilot Week 1; cannot wait for full API migration |
| Stack | Has POS export access; willing to paste sample rows and review mapping with founder/ops |
| Disqualifier | Requires live API cutover, historical order fidelity guarantee, or zero-touch migration today |

### Sales-safe wedge

> “**CSV export** wizard for menu, customers, and orders — preview mapping, continue to Import Center upload, **manual review** on every batch. **not live API** — honest **BETA** posture.”

**Pilot wedge:** Toast/Square operator with menu CSV ready — T-0 export, T+1 wizard preview, T+3 upload with review.

---

## pm-gtm-demo-hook

**15-minute demo path** (migrate → preview → upload):

1. Open [`/dashboard/import-center/migrate`](/dashboard/import-center/migrate) — show Toast / Square / Lightspeed source cards.
2. Select **menu** entity — paste 3–5 sample CSV rows from competitor export template.
3. Click **Preview mapping** — show field map + unmapped column warning (**manual review**).
4. Walk progress bar (pick → preview → upload) — no claim of automated production import.
5. Continue to [`/dashboard/import-center/upload`](/dashboard/import-center/upload) — human gate before go-live.
6. Close with honesty: **not live API**; live POS API migration **BETA** on roadmap.

**Talk track:** “We de-risk switchover with CSV first — API migration is a separate SOW.”

---

## pm-gtm-objection-handling

| Objection | Response |
|-----------|----------|
| “Can you pull everything from Toast API?” | **not live API** today — **CSV export** path with templates for menu, customers, orders. API migration is **BETA** / custom SOW. |
| “Is migration automatic?” | No — **manual review** on unmapped columns and every upload batch. Operator confirms mapping before import. |
| “Square migrated us in a day.” | Competitors vary — our wedge is honest CSV wizard + founder-assisted pilot, not false one-click claims. |
| “Will order history be 100% accurate?” | Historical orders depend on export quality — **manual review** required; do not guarantee parity in contract. |
| “Lightspeed has a migration team.” | We offer certified SI partners for complex scopes — standard pilot uses **CSV export** wizard only. |

---

## pm-gtm-pricing-talk-track

- **Standard pilot:** CSV migration wizard included — no separate migration SKU on [`/pricing`](/pricing) for ≤5 locations.
- **Complex multi-brand / commissary:** Custom enterprise minimum + SI partner SOW — never bundle “live API migration included.”
- **Historical order backfill:** Time-and-materials or SI quote — label **BETA** until cert tests and `/trust` update.
- Anchor **sales-safe** list pricing; API migration is additive post-CSV success.

---

## pm-gtm-primary-cta

| Motion | CTA |
|--------|-----|
| Toast/Square switcher (menu ready) | “Pilot Week 1 — export menu CSV, run wizard preview, schedule 30-min mapping review.” |
| Lightspeed prospect | “Discovery call — share export template; demo 3-source picker on `/dashboard/import-center/migrate`.” |
| Enterprise RFP (API migration) | “Route to founder — attach RFP data clause; no verbal-commit on live API GA date.” |

Primary links: [`/dashboard/import-center/migrate`](/dashboard/import-center/migrate) · [`/dashboard/import-center`](/dashboard/import-center)

---

## pm-gtm-honesty-guardrails

**Do **not** claim:**

- Live Toast/Square/Lightspeed API migration without **BETA** label and signed SOW  
- One-click or zero-touch production import without **manual review**  
- 100% historical order or customer parity from CSV alone  
- Certified competitor migration partner status  

**Always label:** **CSV export** · **not live API** · **BETA** (API path) · **manual review** · **sales-safe** talk tracks only  

**Human gate:** Founder + ops sign-off before any contract appendix stating migration scope or timeline.

---

## Wiring checklist

- [ ] `/trust` free of “automated migration” forbidden claims  
- [ ] Sales deck links to `components/import/migration-wizard-client.tsx` honesty banner language  
- [ ] Import Center strip points to `/dashboard/import-center/migrate`  
- [ ] Pilot Week 1 roadmap includes CSV export step before first live order  
