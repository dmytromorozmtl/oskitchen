# POS Cash Management setup (Era 173)

Era 173 certifies POS Cash Management wiring (Round 2): open float, mid-shift count, close with variance, and printable report — with canonical proof via era98 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `app/dashboard/pos/cash/page.tsx` | Cash management dashboard route |
| `components/pos/pos-cash-management-client.tsx` | Open / count / close / report panels |
| `lib/pos/pos-cash-management.ts` | Workflow steps + close report builder |
| `actions/pos/cash.ts` | Server actions for counts and close |
| `services/pos/pos-cash-management-service.ts` | Shift drawer bootstrap |
| `services/pos/pos-cash-count-service.ts` | Cash drawer count persistence |
| `lib/pos/pos-subnav-links.ts` | POS subnav cash link |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:pos-cash-management-era173` | Full era173 cert + wiring audit |
| `npm run test:ci:pos-cash-management-era173` | Era173 + era98 + cash unit tests |
| `npm run test:ci:pos-cash-management-era173:cert` | Wiring cert only (CI gate) |
| `npm run smoke:pos-cash-management-era98` | Canonical era98 smoke |

## Human activation

1. Open **Dashboard → POS → Cash** — open drawer with starting float.
2. Record mid-shift count — verify variance preview.
3. Close shift with final count and variance acknowledgment.
4. Run `npm run smoke:pos-cash-management-era173` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `open_float` | `pos-cash-open-panel` starting float |
| `mid_shift_count` | `pos-cash-count-panel` + `recordCashCountAction` |
| `close_variance` | `pos-cash-close-panel` variance acknowledgment |
| `close_report` | `buildCashCloseReport` + `pos-cash-report-panel` |

## Artifact

Summary written to `artifacts/pos-cash-management-era173-smoke-summary.json` (gitignored).

See also: [pos-cash-management-era98-setup.md](./pos-cash-management-era98-setup.md)
