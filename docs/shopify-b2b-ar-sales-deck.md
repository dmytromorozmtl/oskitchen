# Shopify B2B AR — Wholesale Sales Deck

**Product:** OS Kitchen × Shopify Markets B2B  
**Route:** `/dashboard/receivables`  
**Flag:** `SHOPIFY_MARKETS_B2B_AR_DASHBOARD=1`

---

## One-liner

**Consolidated B2B accounts receivable for Shopify wholesale — aging, credit limits, auto-reminders, and pay links in one command center.**

---

## Problem (buyer pain)

| Pain | Without OS Kitchen | With OS Kitchen |
|------|-------------------|-----------------|
| AR scattered across Shopify + ops tools | Manual spreadsheet aging | Live aging buckets (current → 61+) |
| Credit exposure invisible | Surprise over-limit orders | Per-company credit limits + utilization |
| Collections manual | Email one invoice at a time | Bulk reminders + auto-dunning cadence |
| Payment friction | Send Shopify admin links | Mint pay portal + consolidated pay links |

---

## Feature map

### 1. Aging report
- Buckets: current, 0–30, 31–60, 61+ days past due
- Company rollups with max days past due
- Health score (0–100) with drift detection vs Shopify financial mirror
- CSV export for finance / ERP

### 2. Credit limits
- Set per-company ceiling in dashboard
- Utilization % with OK / near limit / over limit badges
- Headroom calculation for credit committee reviews

### 3. Auto-reminders
- Configurable dunning cadence (default 7 / 14 / 21 days)
- Auto-reminder counter + operator digest stats
- Manual bulk reminders for urgent escalations
- Pay link minting (single + consolidated batch)

### 4. Collector workflow (optional)
- Assign collector per company
- SLA-breached task queue when collector module enabled

---

## Demo flow (8 minutes)

1. **Order Hub** — show promoted B2B net-terms order with invoice draft metadata.
2. **Receivables** — aging tiles, health score, open invoice table.
3. **Credit limits** — set $50k limit, show utilization after open AR.
4. **Auto-reminders** — point to cadence + auto-sent count; trigger bulk reminder on overdue row.
5. **Pay link** — mint portal link, copy to clipboard.
6. **Export** — download CSV for CFO appendix.

---

## Honest scope

- Shopify payment status is a **read-only mirror** when captured at import — not a bidirectional ledger.
- Credit limits are **KitchenOS-configured** ceilings for ops guardrails; Shopify Plus company credit may differ.
- Auto-reminders require email configured + `b2bArReminderEnabled` on Shopify integration settings.

---

## Competitive positioning

| Capability | Generic ERP bridge | OS Kitchen B2B AR |
|------------|-------------------|-------------------|
| Kitchen + wholesale single pane | No | Yes — same order spine as KDS/POS |
| Shopify Markets native | Partial | Invoice draft + B2B enrichment at promote |
| Operator UX | Finance-only | Collections + kitchen ops same workspace |
| Pay portal | Custom build | Built-in mint + consolidated pay |

---

## Procurement artifacts

- Dashboard: `/dashboard/receivables`
- Integration settings: `/dashboard/integrations/shopify`
- Related docs: `docs/shopify-markets-rfc.md` (B2B AR section)

---

## Pilot checklist

- [ ] Shopify Markets connected with B2B company import
- [ ] Net-terms orders promoted with invoice drafts
- [ ] Credit limits configured for top 10 wholesale accounts
- [ ] Auto-dunning enabled + operator digest email verified
- [ ] Finance sign-off on CSV export format
