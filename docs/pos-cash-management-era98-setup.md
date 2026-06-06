# POS Cash Management smoke setup (Era 98)

Era 98 certifies cash drawer workflow wiring: open float, mid-shift count, close with variance, and printable end-of-shift reports.

## Wiring surfaces

| Path | Role |
|------|------|
| `app/dashboard/pos/cash/page.tsx` | Cash management entry + permissions gate |
| `components/pos/pos-cash-management-client.tsx` | Four-step UI: open, count, close, report |
| `lib/pos/pos-cash-management.ts` | Workflow steps + printable close report builder |
| `actions/pos/cash.ts` | Server action — recordCashCountAction |
| `services/pos/pos-cash-count-service.ts` | Mid-shift count + audit trail |
| `services/pos/pos-cash-management-service.ts` | Bootstrap loader (registers, shifts, counts) |
| `lib/pos/pos-subnav-links.ts` | POS subnav Cash link |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:pos-cash-management-era98` | Full era98 cert + wiring audit |
| `npm run test:ci:pos-cash-management-era98` | Era98 + cash management unit tests |
| `npm run test:ci:pos-cash-management-era98:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → POS → Cash**.
2. **Open** drawer with starting float on a register.
3. **Count** mid-shift — verify variance preview without closing.
4. **Close** shift with final count and variance acknowledgment.
5. **Report** — print or copy end-of-shift cash close report.
6. Run `npm run smoke:pos-cash-management-era98` — artifact **PASSED**.

## Workflow steps

| Step | Action |
|------|--------|
| Open | Start shift with opening float |
| Count | Mid-shift blind count (shift stays open) |
| Close | Final count + variance ack + close shift |
| Report | Printable cash close report for closed shifts |

## Artifact

Summary written to `artifacts/pos-cash-management-smoke-summary.json` (gitignored).
