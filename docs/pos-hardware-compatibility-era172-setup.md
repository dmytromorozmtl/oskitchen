# POS Hardware Compatibility setup (Era 172)

Era 172 certifies the certified-device documentation chain (Round 2): operator doc ↔ code catalog ↔ in-app hardware matrix — with canonical proof via era97 live smoke.

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
| `npm run smoke:pos-hardware-compatibility-era172` | Full era172 cert + doc/catalog audit |
| `npm run test:ci:pos-hardware-compatibility-era172` | Era172 + era97 + hardware unit tests |
| `npm run test:ci:pos-hardware-compatibility-era172:cert` | Wiring cert only (CI gate) |
| `npm run smoke:pos-hardware-compatibility-era97` | Canonical era97 smoke |

## Human activation

1. Read **`docs/hardware-compatibility.md`** — confirm Epson, PAX, Star Micronics, barcode scanners.
2. Open **Dashboard → POS → Settings → Hardware** — matrix matches catalog tiers.
3. Field deploy: wedge scanner + Epson/Star browser print + Stripe Terminal or PAX external capture.
4. Run `npm run smoke:pos-hardware-compatibility-era172` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `epson_receipt_printers` | Epson TM series in certified catalog |
| `pax_payment_terminals` | PAX A920 / external capture tier |
| `star_micronics_printers` | Star TSP100 / mC-Print in catalog |
| `barcode_scanners` | USB/Bluetooth wedge scanner section |

## Artifact

Summary written to `artifacts/pos-hardware-compatibility-era172-smoke-summary.json` (gitignored).

See also: [pos-hardware-compatibility-era97-setup.md](./pos-hardware-compatibility-era97-setup.md)
