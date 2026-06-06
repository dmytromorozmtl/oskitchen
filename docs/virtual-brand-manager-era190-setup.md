# Virtual Brand Manager setup (Era 190)

Era 190 certifies Virtual Brand Manager wiring (Round 2): create a virtual brand in ~5 minutes via template, provision, starter menu, and storefront link — with canonical proof via era115 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/enterprise/virtual-brand-service.ts` | Dashboard loader + `provisionVirtualBrand` transaction |
| `lib/enterprise/virtual-brand-builders.ts` | Provision steps, templates, launch checklist |
| `lib/enterprise/virtual-brand-policy.ts` | Policy id, route, 5-minute target |
| `actions/virtual-brand.ts` | Server action `provisionVirtualBrandQuick` |
| `app/dashboard/enterprise/virtual-brand/page.tsx` | Virtual Brand Manager page |
| `components/enterprise/virtual-brand-manager-panel.tsx` | Template picker, provision form, brand list |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:virtual-brand-manager-era190` | Full era190 cert + wiring audit |
| `npm run test:ci:virtual-brand-manager-era190` | Era190 + era115 + virtual brand manager unit tests |
| `npm run test:ci:virtual-brand-manager-era190:cert` | Wiring cert only (CI gate) |
| `npm run smoke:virtual-brand-manager-era115` | Canonical era115 smoke |

## Human activation

1. Open **Dashboard → Enterprise → Virtual Brand Manager**.
2. Pick a **template** — ghost kitchen, cloud kitchen, meal prep, or catering.
3. Enter **brand name** and optional menu clone source.
4. Click **Launch virtual brand** — verify redirect to brand detail with starter menu.
5. Run `npm run smoke:virtual-brand-manager-era190` — artifact **PASSED**.

## Provision flow

| Step | Duration |
|------|----------|
| `pick_template` | ~1 min |
| `name_brand` | ~1 min |
| `auto_provision` | ~2 min |
| `launch_checklist` | ~1 min |

Total target: **5 minutes**.

## Artifact

Summary written to `artifacts/virtual-brand-manager-era190-smoke-summary.json` (gitignored).

See also: [virtual-brand-manager-era115-setup.md](./virtual-brand-manager-era115-setup.md)
