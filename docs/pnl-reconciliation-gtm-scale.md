# P&L Reconciliation View — GTM & Sales Scale Playbook

<!-- pm-gtm: absolute-final-pm-marketing-full-scale-v1 task-143 feature-98 -->

> **pm-gtm-hero-banner** · **P&L reconciliation view** — **BETA** line-by-line operational P&L vs journal GL comparison
>
> Statement amounts vs journal-derived GL totals with synced / minor / material severity bands. **operational P&L** source — **not a certified GL** — **accountant review** before period close.
>
> **pm-gtm-dark-mode-note:** Plain markdown — readable in GitHub light and dark themes.

**Policy:** `pnl-reconciliation-gtm-scale-absolute-final-v1`  
**Product surface:** [`/dashboard/accounting/pnl-reconciliation`](/dashboard/accounting/pnl-reconciliation) · [`components/dashboard/accounting/pnl-reconciliation-view-panel.tsx`](../components/dashboard/accounting/pnl-reconciliation-view-panel.tsx) · `pnl-reconciliation-view-absolute-final-v1`  
**Related:** [`/dashboard/accounting/gl-sync`](/dashboard/accounting/gl-sync) · [`/dashboard/accounting/journal-export`](/dashboard/accounting/journal-export) · [`objection-handling.md`](./objection-handling.md) · [`/trust`](/trust)

---

## pm-gtm-icp-profile

### Ideal buyer

| Attribute | Fit |
|-----------|-----|
| Model | Operator with bookkeeper who needs period-close variance visibility between POS P&L and GL journals |
| Pain | Statement vs journal mismatches discovered late; wants line-by-line severity before export |
| Stack | OS Kitchen GL-depth sync + journal export + restaurant COA template |
| Disqualifier | Requires audit-grade reconciliation, certified GL sign-off, or ERP replacement |

### Sales-safe wedge

> “**BETA** P&L reconciliation — **operational P&L** vs journal GL with material variance flags. **not a certified GL** — **accountant review** before close. **Do not claim** audit-grade reconciliation.”

**Pilot wedge:** Single-location operator — T+1 open reconciliation view, T+3 resolve one material variance, T+7 bookkeeper signs off before journal export.

---

## pm-gtm-demo-hook

**8-minute demo path** (reconciliation → GL sync → journal export):

1. Open [`/dashboard/accounting/pnl-reconciliation`](/dashboard/accounting/pnl-reconciliation) — walk hero banner **BETA** + **operational P&L** honesty copy.
2. Show reconciliation % badge row — synced / minor / material counts.
3. Walk summary cards — net variance, balance check, ≥5% material threshold.
4. Scroll line-by-line table — statement vs journal GL with severity badges.
5. Export CSV — walk variance columns for bookkeeper handoff.
6. Cross-link [`/dashboard/accounting/gl-sync`](/dashboard/accounting/gl-sync) and [`/dashboard/accounting/journal-export`](/dashboard/accounting/journal-export).
7. Close with `/trust` — no “audit-grade reconciliation” or “certified GL close” claims.

**Talk track:** “Period-close variance radar — not an audit platform.”

---

## pm-gtm-objection-handling

| Objection | Response |
|-----------|----------|
| “Is this audit-grade reconciliation?” | **Do not claim** audit-grade scope — **BETA** view compares **operational P&L** to journal GL; **accountant review** required. |
| “Does it auto-close the period?” | No auto-close — severity bands flag material variances (≥5%) for human review before export. |
| “Toast has accounting built in.” | Competitors vary — our wedge is honest variance severity + GL-depth sync path + **not a certified GL** label. |
| “We need CPA sign-off.” | Encourage **accountant review** — export CSV for bookkeeper validation in pilot Week 1. |

---

## pm-gtm-pricing-talk-track

- **Standard pilot:** P&L reconciliation view included — no separate reconciliation module SKU on [`/pricing`](/pricing).
- **Multi-location rollup:** Enterprise scoping with founder — not bundled as “audit-grade close package.”
- **SOC2 / audit RFP:** Custom quote or decline — never list certified GL reconciliation in standard pricing.
- Anchor **sales-safe** claims until `/trust` updates accounting reconciliation language.

---

## pm-gtm-primary-cta

| Motion | CTA |
|--------|-----|
| Operator with external bookkeeper | “Pilot Week 1 — open `/dashboard/accounting/pnl-reconciliation`, resolve one material variance, bookkeeper signs off.” |
| GL-depth prospect | “Discovery call — demo synced vs material bands on staging tenant with sample period.” |
| Enterprise RFP (audit-grade close) | “Route to founder — attach scope; **Do not claim** audit-grade reconciliation without legal review.” |

Primary links: [`/dashboard/accounting/pnl-reconciliation`](/dashboard/accounting/pnl-reconciliation) · [`/dashboard/accounting/journal-export`](/dashboard/accounting/journal-export)

---

## pm-gtm-honesty-guardrails

**Do **not** claim:**

- Audit-grade or certified GL period-close reconciliation  
- Automatic period close or guaranteed zero-variance SLA  
- SOC2-audit-ready reconciliation trail as standard pilot deliverable  
- Full competitor accounting parity without **BETA** label  

**Always label:** **BETA** · **operational P&L** · **not a certified GL** · **accountant review** · **Do not claim** audit-grade scope · **sales-safe** talk tracks only  

**Human gate:** Founder + finance ops sign-off before any enterprise slide stating reconciliation or period-close certification scope.

---

## Wiring checklist

- [ ] `/trust` free of “audit-grade reconciliation” or “certified GL close” forbidden claims  
- [ ] Sales deck links to `components/dashboard/accounting/pnl-reconciliation-view-panel.tsx` honesty banner  
- [ ] GL-sync and journal export pages cross-link to `/dashboard/accounting/pnl-reconciliation`  
- [ ] Pilot Week 1 roadmap includes bookkeeper variance review step  
