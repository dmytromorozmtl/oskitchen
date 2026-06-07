# Chart of Accounts Mapping — GTM & Sales Scale Playbook

<!-- pm-gtm: absolute-final-pm-marketing-full-scale-v1 task-141 feature-96 -->

> **pm-gtm-hero-banner** · **Chart of accounts mapping** — **BETA** P&L line → GL code bridge
>
> Maps operational P&L lines to restaurant-standard COA codes with optional **QuickBooks** account links — feeds GL-depth journal export. **not a certified GL** — **accountant review** before posting.
>
> **pm-gtm-dark-mode-note:** Plain markdown — readable in GitHub light and dark themes.

**Policy:** `chart-of-accounts-gtm-scale-absolute-final-v1`  
**Product surface:** [`/dashboard/accounting/chart-of-accounts`](/dashboard/accounting/chart-of-accounts) · [`components/dashboard/accounting/chart-of-accounts-mapping-panel.tsx`](../components/dashboard/accounting/chart-of-accounts-mapping-panel.tsx) · `chart-of-accounts-mapping-absolute-final-v1`  
**Related:** [`/dashboard/accounting/gl-sync`](/dashboard/accounting/gl-sync) · [`objection-handling.md`](./objection-handling.md) · [`/trust`](/trust)

---

## pm-gtm-icp-profile

### Ideal buyer

| Attribute | Fit |
|-----------|-----|
| Model | Independent operator or small group with bookkeeper who needs P&L lines mapped to GL before QuickBooks export |
| Pain | Manual spreadsheet mapping between OS Kitchen P&L categories and accountant's chart of accounts |
| Stack | OS Kitchen GL-depth sync + optional QuickBooks LIVE integration |
| Disqualifier | Requires certified GL system of record, SOC2 audit trail for journal posting, or full ERP replacement |

### Sales-safe wedge

> “**BETA** COA mapping — 8 standard P&L lines to restaurant COA template. Optional **QuickBooks** link — **not a certified GL**; **accountant review** required before posting.”

**Pilot wedge:** Single-location operator — T+1 map revenue + food cost lines, T+3 connect QuickBooks, T+7 bookkeeper validates mapping before first journal export.

---

## pm-gtm-demo-hook

**8-minute demo path** (COA panel → GL sync → QuickBooks):

1. Open [`/dashboard/accounting/chart-of-accounts`](/dashboard/accounting/chart-of-accounts) — walk hero banner **BETA** + **not a certified GL** honesty copy.
2. Show coverage badge row — mapped lines % and QuickBooks linked count.
3. Edit revenue line — select GL code from restaurant COA template (4100 Food & Beverage Sales).
4. If QuickBooks connected — link external account on one P&L line; show linked badge increment.
5. Click **Open GL-depth sync** → [`/dashboard/accounting/gl-sync`](/dashboard/accounting/gl-sync).
6. If not connected — cross-link QuickBooks connect flow (staging tenant only).
7. Close with `/trust` — no “certified GL” or “auto-post to QuickBooks without review” claims.

**Talk track:** “Operational P&L bridge to your bookkeeper's COA — not an ERP replacement.”

---

## pm-gtm-objection-handling

| Objection | Response |
|-----------|----------|
| “Is this a full general ledger?” | **not a certified GL** — mapping layer only; journal export feeds external accounting. **Do not claim** ERP or certified GL scope. |
| “Does it auto-post to QuickBooks?” | Optional **QuickBooks** daily sales journal when linked — **accountant review** before posting; no guaranteed auto-post SLA. |
| “Toast has built-in accounting.” | Competitors vary — our wedge is restaurant-standard COA template + honest **BETA** maturity + GL-depth sync path. |
| “We need CPA sign-off on mappings.” | Encourage **accountant review** — export mapping CSV for bookkeeper validation in pilot Week 1. |

---

## pm-gtm-pricing-talk-track

- **Standard pilot:** Chart of accounts mapping included — no separate COA module SKU on [`/pricing`](/pricing).
- **QuickBooks integration:** Included when LIVE credentials connected — not bundled as “certified GL package.”
- **Enterprise multi-entity COA:** Custom scoping with founder — never list certified GL or audit-ready posting in standard pricing.
- Anchor **sales-safe** claims until `/trust` updates accounting language.

---

## pm-gtm-primary-cta

| Motion | CTA |
|--------|-----|
| Operator with external bookkeeper | “Pilot Week 1 — map 8 P&L lines, bookkeeper validates, open `/dashboard/accounting/chart-of-accounts`.” |
| QuickBooks user prospect | “Discovery call — demo COA mapping + GL-depth sync on staging with one linked account.” |
| Enterprise RFP (certified GL) | “Route to founder — attach scope; **Do not claim** certified GL without legal review.” |

Primary links: [`/dashboard/accounting/chart-of-accounts`](/dashboard/accounting/chart-of-accounts) · [`/dashboard/accounting/gl-sync`](/dashboard/accounting/gl-sync)

---

## pm-gtm-honesty-guardrails

**Do **not** claim:**

- Certified general ledger or ERP replacement  
- Automatic QuickBooks posting without **accountant review**  
- SOC2-audit-ready journal trail as standard pilot deliverable  
- Full competitor accounting parity without **BETA** label  

**Always label:** **BETA** · **not a certified GL** · **accountant review** · **QuickBooks** (optional link) · **Do not claim** certified GL in contracts · **sales-safe** talk tracks only  

**Human gate:** Founder + finance ops sign-off before any enterprise slide stating GL or accounting certification scope.

---

## Wiring checklist

- [ ] `/trust` free of “certified GL” or “auto-post guaranteed” forbidden claims  
- [ ] Sales deck links to `components/dashboard/accounting/chart-of-accounts-mapping-panel.tsx` honesty banner  
- [ ] GL-sync page cross-links to `/dashboard/accounting/chart-of-accounts`  
- [ ] Pilot Week 1 roadmap includes bookkeeper COA validation step  
