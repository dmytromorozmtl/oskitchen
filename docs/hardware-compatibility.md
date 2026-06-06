# POS Hardware Compatibility — Certified Devices

**Status:** Production reference for operators, field techs, and sales  
**Source of truth (code):** [`lib/pos/pos-hardware-certification.ts`](../lib/pos/pos-hardware-certification.ts) · [`lib/pos/pos-hardware.ts`](../lib/pos/pos-hardware.ts)  
**In-app matrix:** [`/dashboard/pos/settings/hardware`](../app/dashboard/pos/settings/hardware/page.tsx)

OS Kitchen is **browser-first**. Certified devices work without proprietary OS Kitchen terminals. Native USB ESC/POS and PAX SDK integrations are roadmap items — this document states what works **today** and how to deploy it honestly.

---

## Certification tiers

| Tier | Meaning |
| --- | --- |
| **certified** | Tested workflow in OS Kitchen POS (terminal, tablet, mobile, handheld). |
| **browser_compatible** | Works via OS/browser print or keyboard wedge — no custom driver required. |
| **external** | Payment captured outside OS Kitchen; operator marks order paid in POS. |
| **roadmap** | Listed for procurement planning; native adapter not shipped yet. |

---

## Barcode scanners (keyboard wedge)

Any scanner that emulates a USB keyboard and appends **Enter** after the barcode is **certified**.

| Vendor | Model | Tier | Setup |
| --- | --- | --- | --- |
| Honeywell | Voyager 1470g | certified | USB to register PC; focus POS search field; scan adds product by `Product.barcode`. |
| Zebra | DS2208 | certified | Same keyboard-wedge profile; works on desktop terminal and tablet POS. |
| Socket Mobile | S700 | certified | Bluetooth wedge for iPad handheld waiter mode at `/dashboard/pos/handheld`. |

**Operator steps**

1. Open **POS Terminal** (`/dashboard/pos/terminal`) or **Tablet POS**.
2. Click the search field (speed mode: “Search or scan barcode + Enter”).
3. Scan — digits type in, Enter matches `Product.barcode` and adds the line.

**Not supported:** Serial (RS-232) scanners without a keyboard wedge emulator, camera-only scan without manual entry.

---

## Epson receipt & kitchen printers

Epson devices are **browser_compatible** — use the system print dialog; OS Kitchen does not ship a raw ESC/POS USB driver.

| Model | Role | Connection | Notes |
| --- | --- | --- | --- |
| TM-T88VI | Receipt | USB / Ethernet | 80mm workhorse; set as default printer, print receipt from POS checkout. |
| TM-m30III | Receipt | USB / Bluetooth | Compact front counter; same browser-print path. |
| TM-L100 | Kitchen / label | USB | Chit and packing labels via browser print until Epson ePOS adapter ships. |

**Operator steps**

1. Install Epson driver on the POS workstation (vendor site).
2. Complete a test sale and open **Print receipt** (browser `window.print()`).
3. Select the Epson queue; save as default for that station.

**Roadmap:** Direct ESC/POS and cash-drawer pulse via supported Epson models (`lib/pos/pos-hardware.ts` → `cash_drawer` placeholder).

---

## Star Micronics receipt & kitchen printers

Star Micronics printers follow the same **browser_compatible** path as Epson.

| Model | Role | Connection | Notes |
| --- | --- | --- | --- |
| TSP143IV | Receipt | USB / Ethernet | CloudPRNT / browser print; StarPRNT native SDK on roadmap. |
| mC-Print3 | Receipt + optional display | USB / Bluetooth | Mobile lanes and expo pass; browser print today. |
| SP742 | Kitchen chit | Ethernet | Impact printer for hot kitchen; print KDS/export chits via browser. |

**Operator steps**

1. Pair printer per Star setup guide (USB or LAN).
2. Share printer to the POS browser host.
3. Print from POS receipt or kitchen export using the OS print dialog.

---

## PAX payment terminals

PAX devices are common in semi-integrated restaurant lanes. OS Kitchen **does not embed the PAX SDK** in this release.

| Model | Tier | How operators use it with OS Kitchen |
| --- | --- | --- |
| A920 Pro | external | Run acquirer/PAX payment app on device; in POS choose **Paid externally** or **Card terminal (mark paid)** after approval. |
| A80 | external | Countertop Android terminal with existing processor; same external-capture workflow. |
| A35 | roadmap | Pinpad — native adapter planned; use **Stripe Terminal** for in-app card capture today. |

**Honest sales line:** PAX is **certified-compatible for external capture**, not in-browser tap-to-pay. Do not claim PAX in-app integration without a shipped adapter.

For **in-app** card-present payments, use **Stripe Terminal** (see below).

---

## Stripe Terminal (in-app card capture)

| Model | Stripe type | Tier |
| --- | --- | --- |
| Stripe Reader M2 | `stripe_m2` | certified |
| BBPOS WisePOS E | `bbpos_wisepos_e` | certified |
| Verifone P400 | `verifone_p400` | certified |

Pair at **Settings → Payment hardware** (`/dashboard/settings/hardware`). Full setup: [`stripe-terminal-hardware.md`](./stripe-terminal-hardware.md).

---

## POS surfaces & hardware

| Surface | Route | Best-fit hardware |
| --- | --- | --- |
| Desktop terminal | `/dashboard/pos/terminal` | Zebra/Honeywell wedge, Epson/Star receipt, Stripe Terminal |
| Tablet POS | `/dashboard/pos/tablet` | iPad + Socket Mobile S700, Bluetooth Epson TM-m30III |
| Mobile POS | `/dashboard/pos/mobile` | Phone + Stripe M2 |
| Handheld waiter | `/dashboard/pos/handheld` | Phone/tablet + Socket S700; fire to KDS online |

---

## Cash drawer & customer display

| Device | Status | Notes |
| --- | --- | --- |
| Cash drawer (printer kick) | placeholder | Requires ESC/POS pulse — not wired; use manual drawer until adapter ships. |
| Customer-facing display | supported | Second monitor at `/dashboard/pos/terminal/customer-display` — F8 toggle; live cart via BroadcastChannel. |

---

## Field checklist (new site)

1. Confirm **register PC or tablet** runs a supported Chromium/Safari browser.
2. Pair **keyboard-wedge scanner**; verify one product barcode end-to-end.
3. Set **Epson or Star** as default OS printer; print test receipt.
4. Choose payments: **Stripe Terminal** (in-app) and/or **PAX external** (mark paid).
5. Open **POS hardware** dashboard to confirm matrix matches deployment.

---

## Related docs

- [`POS_HARDWARE_READINESS.md`](./POS_HARDWARE_READINESS.md) — category status matrix
- [`no-hardware-lock-in-positioning.md`](./no-hardware-lock-in-positioning.md) — sales positioning
- [`stripe-terminal-hardware.md`](./stripe-terminal-hardware.md) — Stripe reader pairing
- [`HANDHELD_ORDERING.md`](./HANDHELD_ORDERING.md) — waiter PWA + scanner on floor

When a device graduates from `browser_compatible` or `external` to native **certified**, update `lib/pos/pos-hardware-certification.ts` and `lib/pos/pos-hardware.ts` in the same PR.
