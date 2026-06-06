# POS Hardware Compatibility smoke setup (Era 97)

Era 97 certifies the certified-device documentation chain: operator doc ↔ code catalog ↔ in-app hardware matrix.

## Wiring surfaces

| Path | Role |
|------|------|
| `docs/hardware-compatibility.md` | Operator field reference — Epson, PAX, Star, scanners |
| `lib/pos/pos-hardware-certification.ts` | Machine-readable certified device catalog |
| `lib/pos/pos-hardware.ts` | In-app category matrix (supported / planned / placeholder) |
| `app/dashboard/pos/settings/hardware/page.tsx` | Dashboard hardware status page |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:pos-hardware-compatibility-era97` | Full era97 cert + doc/catalog audit |
| `npm run test:ci:pos-hardware-compatibility-era97` | Era97 + hardware compatibility unit tests |
| `npm run test:ci:pos-hardware-compatibility-era97:cert` | Wiring cert only (CI gate) |

## Human activation

1. Read **`docs/hardware-compatibility.md`** — confirm Epson, PAX, Star Micronics, barcode scanners.
2. Open **Dashboard → POS → Settings → Hardware** — matrix matches catalog tiers.
3. Field deploy: wedge scanner + Epson/Star browser print + Stripe Terminal or PAX external capture.
4. Run `npm run smoke:pos-hardware-compatibility-era97` — artifact **PASSED**.

## Certification tiers

| Tier | Meaning |
|------|---------|
| certified | Tested workflow in OS Kitchen POS |
| browser_compatible | OS/browser print or keyboard wedge |
| external | Payment captured outside OS Kitchen |
| roadmap | Listed for procurement; adapter not shipped |

## Artifact

Summary written to `artifacts/pos-hardware-compatibility-smoke-summary.json` (gitignored).
