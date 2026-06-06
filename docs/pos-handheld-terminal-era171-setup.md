# Handheld POS terminal setup (Era 171)

Era 171 certifies Handheld POS wiring (Round 2): waiter tableside ordering, fire to KDS, tab sync, and offline cash checkout — with canonical proof via era96 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `app/dashboard/pos/handheld/page.tsx` | Handheld POS entry |
| `app/dashboard/pos/handheld/manifest.webmanifest/route.ts` | Standalone PWA manifest |
| `components/pos/handheld-ordering-client.tsx` | Table tiles + cart + Fire to KDS |
| `lib/pos/handheld-ordering.ts` | Tab lookup + KDS route constants |
| `actions/pos/handheld.ts` | Server actions for fire + checkout |
| `services/pos/handheld-kds-fire-service.ts` | Kitchen routing on fire |
| `services/pos/handheld-ordering-service.ts` | Bootstrap loader |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:pos-handheld-terminal-era171` | Full era171 cert + wiring audit |
| `npm run test:ci:pos-handheld-terminal-era171` | Era171 + era96 + KDS fire tests |
| `npm run test:ci:pos-handheld-terminal-era171:cert` | Wiring cert only (CI gate) |
| `npm run smoke:pos-handheld-terminal-era96` | Canonical era96 smoke |

## Human activation

1. Open **Dashboard → POS → Handheld** on a phone or tablet (375px+).
2. Select a table, add items, tap **Fire to KDS** — verify kitchen work items.
3. Complete cash checkout or queue offline sale — verify tab sync.
4. Run `npm run smoke:pos-handheld-terminal-era171` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `table_select` | `handheld-table-tile` table picker |
| `waiter_ordering` | Cart build + item modifiers |
| `kds_fire` | `fireHandheldOrderToKds` → kitchen routing |
| `tab_sync` | `findOpenTabForTable` + checkout sync |

## Artifact

Summary written to `artifacts/pos-handheld-terminal-era171-smoke-summary.json` (gitignored).

See also: [pos-handheld-terminal-era96-setup.md](./pos-handheld-terminal-era96-setup.md)
