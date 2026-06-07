# Journal Entry Export — GTM & Sales Scale Playbook

<!-- pm-gtm: absolute-final-pm-marketing-full-scale-v1 task-142 feature-97 -->

> **pm-gtm-hero-banner** · **Journal entry export** — **BETA** balanced double-entry export from operational P&L
>
> CSV, JSON, and **QuickBooks** CSV formats with COA mapping overlays — feeds bookkeeper workflow. **not a certified GL** — **accountant review** before posting.
>
> **pm-gtm-dark-mode-note:** Plain markdown — readable in GitHub light and dark themes.

**Policy:** `journal-entry-export-gtm-scale-absolute-final-v1`  
**Product surface:** [`/dashboard/accounting/journal-export`](/dashboard/accounting/journal-export) · [`components/dashboard/accounting/journal-entry-export-panel.tsx`](../components/dashboard/accounting/journal-entry-export-panel.tsx) · `journal-entry-export-absolute-final-v1`  
**Related:** [`/dashboard/accounting/chart-of-accounts`](/dashboard/accounting/chart-of-accounts) · [`/dashboard/accounting/gl-sync`](/dashboard/accounting/gl-sync) · [`objection-handling.md`](./objection-handling.md) · [`/trust`](/trust)

---

## pm-gtm-icp-profile

### Ideal buyer

| Attribute | Fit |
|-----------|-----|
| Model | Operator with external bookkeeper who needs periodic journal exports from OS Kitchen P&L |
| Pain | Manual re-keying of sales and cost lines into QuickBooks or external ledger |
| Stack | OS Kitchen GL-depth sync + COA mapping + optional QuickBooks LIVE link |
| Disqualifier | Requires certified GL auto-posting, audit-ready journal trail, or ERP replacement |

### Sales-safe wedge

> “**BETA** journal export — CSV, JSON, and **QuickBooks** CSV from balanced operational P&L. **not a certified GL** — **accountant review** before posting. **Do not claim** auto-post SLA.”

**Pilot wedge:** Single-location operator — T+1 map COA lines, T+3 export first period CSV, T+7 bookkeeper validates before QuickBooks import.

---

## pm-gtm-demo-hook

**8-minute demo path** (COA → journal export → download):

1. Open [`/dashboard/accounting/journal-export`](/dashboard/accounting/journal-export) — walk hero banner **BETA** + **not a certified GL** honesty copy.
2. Show balanced badge row — entry count, line count, QuickBooks mapped lines.
3. Preview table — debits/credits for current period with account codes from COA mapping.
4. Download CSV — walk standard double-entry format with P&L line keys.
5. Download QuickBooks CSV — show external account ID column when COA mapping linked.
6. Cross-link [`/dashboard/accounting/chart-of-accounts`](/dashboard/accounting/chart-of-accounts) — edit mapping before re-export.
7. Close with `/trust` — no “certified GL export” or “guaranteed QuickBooks auto-post” claims.

**Talk track:** “Operational P&L to bookkeeper-ready journals — export layer, not an ERP.”

---

## pm-gtm-objection-handling

| Objection | Response |
|-----------|----------|
| “Does this auto-post to QuickBooks?” | **QuickBooks** CSV is import-ready — **accountant review** required; **Do not claim** automatic posting or certified GL scope. |
| “Is the export audit-ready?” | **not a certified GL** — **BETA** export from operational data; bookkeeper validates before ledger posting. |
| “What formats do you support?” | CSV, JSON, and QuickBooks CSV — balanced double-entry with COA mapping overlays. |
| “We need CPA sign-off.” | Encourage **accountant review** — export JSON includes disclaimer; pilot Week 1 includes bookkeeper validation step. |

---

## pm-gtm-pricing-talk-track

- **Standard pilot:** Journal entry export included — no separate export module SKU on [`/pricing`](/pricing).
- **QuickBooks CSV format:** Included when COA mapping links external accounts — not bundled as “certified GL package.”
- **Enterprise audit trail RFP:** Custom scoping with founder — never list certified GL or auto-post SLA in standard pricing.
- Anchor **sales-safe** claims until `/trust` updates accounting export language.

---

## pm-gtm-primary-cta

| Motion | CTA |
|--------|-----|
| Operator with external bookkeeper | “Pilot Week 1 — map COA, export one period CSV, bookkeeper validates at `/dashboard/accounting/journal-export`.” |
| QuickBooks user prospect | “Discovery call — demo balanced export + QuickBooks CSV on staging tenant.” |
| Enterprise RFP (certified GL) | “Route to founder — attach scope; **Do not claim** certified GL without legal review.” |

Primary links: [`/dashboard/accounting/journal-export`](/dashboard/accounting/journal-export) · [`/dashboard/accounting/chart-of-accounts`](/dashboard/accounting/chart-of-accounts)

---

## pm-gtm-honesty-guardrails

**Do **not** claim:**

- Certified general ledger or audit-ready journal trail  
- Automatic **QuickBooks** posting without **accountant review**  
- Guaranteed balanced exports for all edge-case P&L periods without validation  
- Full competitor accounting parity without **BETA** label  

**Always label:** **BETA** · **not a certified GL** · **accountant review** · **QuickBooks** (CSV format) · **Do not claim** auto-post or certified GL in contracts · **sales-safe** talk tracks only  

**Human gate:** Founder + finance ops sign-off before any enterprise slide stating journal export or GL certification scope.

---

## Wiring checklist

- [ ] `/trust` free of “certified GL export” or “auto-post guaranteed” forbidden claims  
- [ ] Sales deck links to `components/dashboard/accounting/journal-entry-export-panel.tsx` honesty banner  
- [ ] COA mapping page cross-links to `/dashboard/accounting/journal-export`  
- [ ] Pilot Week 1 roadmap includes bookkeeper journal validation step  
