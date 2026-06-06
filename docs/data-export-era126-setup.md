# Data Export & Portability smoke setup (Era 126)

Era 126 certifies Data Export & Portability wiring: full workspace CSV domains and JSON manifest for GDPR-ready exports.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/data/export-service.ts` | Portability snapshot, row counts, manifest builder |
| `lib/data/export-builders.ts` | Domain, lane, snapshot builders + lane map |
| `lib/data/export-policy.ts` | Policy id, route, manifest route, formats |
| `app/dashboard/data/export/page.tsx` | Data Export & Portability page |
| `components/data/data-export-panel.tsx` | Summary cards, domain lanes, CSV/JSON downloads |
| `app/api/data/portability-manifest/route.ts` | JSON manifest download API |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:data-export-era126` | Full era126 cert + wiring audit |
| `npm run test:ci:data-export-era126` | Era126 + data export unit tests |
| `npm run test:ci:data-export-era126:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Data → Export & Portability**.
2. Review **summary cards** — Export lanes, Domains, Portable rows, Manifest.
3. Inspect **five lanes** — Operations, Catalog, Purchasing, Integrations, Compliance.
4. Download **CSV** per domain or **JSON manifest** for full portability index.
5. Run `npm run smoke:data-export-era126` — artifact **PASSED**.

## Lanes & formats

| Lane | Domains |
|------|---------|
| `operations` | orders, customers, packing, production |
| `catalog` | menus, products, brands, locations, recipes, nutrition |
| `purchasing` | inventory, suppliers, POs, demand, costing |
| `integrations` | integrations metadata |
| `compliance` | reports, audit logs |

Formats: **csv** (per domain) · **json-manifest** (full index)

## Artifact

Summary written to `artifacts/data-export-smoke-summary.json` (gitignored).
