# Accountant Portal — GTM & Sales Scale Playbook

<!-- pm-gtm: absolute-final-pm-marketing-full-scale-v1 task-144 feature-99 -->

> **pm-gtm-hero-banner** · **Accountant portal** — **BETA** read-only export hub for external bookkeepers
>
> Period-close checklist, finance deliverables, and quick export bundle — COA mapping, journals, reconciliation, QuickBooks handoff. **read-only** navigation — **not a certified GL** — **accountant review** before posting.
>
> **pm-gtm-dark-mode-note:** Plain markdown — readable in GitHub light and dark themes.

**Policy:** `accountant-portal-gtm-scale-absolute-final-v1`  
**Product surface:** [`/dashboard/accounting/accountant-portal`](/dashboard/accounting/accountant-portal) · [`components/dashboard/accounting/accountant-portal-panel.tsx`](../components/dashboard/accounting/accountant-portal-panel.tsx) · `accountant-portal-absolute-final-v1`  
**Related:** [`/dashboard/accounting/gl-sync`](/dashboard/accounting/gl-sync) · [`/dashboard/accounting/chart-of-accounts`](/dashboard/accounting/chart-of-accounts) · [`objection-handling.md`](./objection-handling.md) · [`/trust`](/trust)

---

## pm-gtm-icp-profile

### Ideal buyer

| Attribute | Fit |
|-----------|-----|
| Model | Independent operator with external bookkeeper or CPA who needs a single handoff hub each period |
| Pain | Scattered exports across COA, journals, reconciliation, and QuickBooks — no period-close checklist |
| Stack | OS Kitchen GL-depth sync + optional QuickBooks LIVE + external accountant workflow |
| Disqualifier | Requires multi-tenant CPA login, certified GL portal, or audit-grade handoff SLA |

### Sales-safe wedge

> “**BETA** accountant portal — **read-only** export hub with period-close checklist. **not a certified GL** — **Do not claim** multi-tenant CPA login or audit-grade handoff.”

**Pilot wedge:** Single-location operator — T+1 invite bookkeeper to portal walkthrough, T+3 download export bundle, T+7 accountant validates before QuickBooks post.

---

## pm-gtm-demo-hook

**8-minute demo path** (portal → deliverables → export bundle):

1. Open [`/dashboard/accounting/accountant-portal`](/dashboard/accounting/accountant-portal) — walk hero banner **BETA** + **read-only** honesty copy.
2. Show period-close checklist — COA 100%, material variances, **accountant review** before QuickBooks post.
3. Walk pillar cards — export hub, COA & journals, reconciliation, QuickBooks, read-only posture.
4. Open COA mapping deliverable → [`/dashboard/accounting/chart-of-accounts`](/dashboard/accounting/chart-of-accounts).
5. Show journal export + P&L reconciliation deliverables with LIVE/BETA/SKIPPED maturity labels.
6. Download quick export bundle — journal CSV/JSON + reconciliation CSV.
7. Close with `/trust` — no “CPA login portal” or “audit-grade handoff” claims.

**Talk track:** “One hub for your bookkeeper — exports and checklist, not an ERP replacement.”

---

## pm-gtm-objection-handling

| Objection | Response |
|-----------|----------|
| “Can my CPA log in directly?” | **Do not claim** multi-tenant CPA login — **read-only** export hub for operator to share downloads; **not a certified GL** portal. |
| “Is this audit-grade handoff?” | **Do not claim** audit-grade scope — **BETA** checklist + exports; **accountant review** before posting. |
| “Does it auto-post to QuickBooks?” | QuickBooks handoff deliverable links LIVE integration — operator posts after **accountant review**; no auto-post SLA. |
| “Toast has accountant access.” | Competitors vary — our wedge is honest maturity labels + export bundle + period-close checklist. |

---

## pm-gtm-pricing-talk-track

- **Standard pilot:** Accountant portal included — no separate CPA portal SKU on [`/pricing`](/pricing).
- **External bookkeeper onboarding:** Founder-assisted portal walkthrough — not bundled as “certified GL handoff package.”
- **Enterprise multi-entity CPA access:** Custom scoping or decline — never list audit-grade handoff in standard pricing.
- Anchor **sales-safe** claims until `/trust` updates accountant portal language.

---

## pm-gtm-primary-cta

| Motion | CTA |
|--------|-----|
| Operator with external bookkeeper | “Pilot Week 1 — open `/dashboard/accounting/accountant-portal`, download export bundle, bookkeeper validates.” |
| QuickBooks + CPA prospect | “Discovery call — demo period-close checklist + deliverable maturity on staging tenant.” |
| Enterprise RFP (CPA login portal) | “Route to founder — attach scope; **Do not claim** multi-tenant CPA login without legal review.” |

Primary links: [`/dashboard/accounting/accountant-portal`](/dashboard/accounting/accountant-portal) · [`/dashboard/accounting/gl-sync`](/dashboard/accounting/gl-sync)

---

## pm-gtm-honesty-guardrails

**Do **not** claim:**

- Multi-tenant CPA or accountant login portal  
- Certified GL or audit-grade period-close handoff  
- Automatic QuickBooks posting without **accountant review**  
- Full competitor accounting parity without **BETA** label  

**Always label:** **BETA** · **read-only** · **not a certified GL** · **accountant review** · **Do not claim** CPA login or audit-grade handoff · **sales-safe** talk tracks only  

**Human gate:** Founder + finance ops sign-off before any enterprise slide stating accountant portal or CPA access scope.

---

## Wiring checklist

- [ ] `/trust` free of “CPA login portal” or “audit-grade handoff” forbidden claims  
- [ ] Sales deck links to `components/dashboard/accounting/accountant-portal-panel.tsx` honesty banner  
- [ ] GL-sync and COA mapping pages cross-link to `/dashboard/accounting/accountant-portal`  
- [ ] Pilot Week 1 roadmap includes bookkeeper portal walkthrough step  
