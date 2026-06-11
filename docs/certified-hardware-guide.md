# Certified hardware guide — deploy OS Kitchen without proprietary terminals

**Policy:** `certified-hardware-guide-p2-86-v1`  
**Audience:** Operators, field techs, sales, pilot onboarding  
**Framework:** Browser-first · optional hardware · honest certification tiers  
**Catalog (code):** [`lib/pos/pos-hardware-certification.ts`](../lib/pos/pos-hardware-certification.ts)  
**Device matrix (detail):** [`docs/hardware-compatibility.md`](./hardware-compatibility.md)  
**Positioning:** [`software-first-pos-positioning.md`](./software-first-pos-positioning.md)

OS Kitchen is **browser-first** — run POS, KDS, and packing on **iPad**, tablets, and browsers you already own. Proprietary terminal leases are **not required**. This guide covers **7 operator categories** for typical pilot deployments.

---

## Certification tiers

| Tier | Meaning |
|------|---------|
| **certified** | Tested workflow in OS Kitchen (POS, KDS, scanner wedge, Stripe Terminal). |
| **browser_compatible** | Works via OS/browser print or keyboard wedge — no custom driver. |
| **external** | Payment captured outside OS Kitchen; mark paid in POS. |
| **roadmap** | Procurement planning — native adapter not shipped. |

**verify** Integration Health and hardware smoke artifacts before claiming LIVE payment or printer integrations.

---

## Seven hardware categories

<!-- category-ipad_tablets -->
### 1. iPad & tablets

| | |
|---|---|
| **Tier** | certified |
| **Route** | `/dashboard/pos/tablet` |
| **Examples** | iPad (10th gen+), iPad Pro (KDS expo), Samsung Galaxy Tab A9 |

Safari or Chrome on tablet — counter POS, handheld waiter, and fullscreen KDS. **Not a native iOS app** — browser PWA. Offline card EMV is **not certified**; verify network for Stripe Terminal capture.

<!-- category-receipt_printers -->
### 2. Receipt printers

| | |
|---|---|
| **Tier** | browser_compatible |
| **Route** | `/dashboard/pos/terminal` |
| **Examples** | Epson TM-T88VI, TM-m30III · Star TSP143IV, mC-Print3 |

58/80mm thermal receipts via OS print dialog. Native ESC/POS USB driver is **roadmap** — **typical** setup uses system default printer queue.

<!-- category-kitchen_screens -->
### 3. Kitchen screens (KDS)

| | |
|---|---|
| **Tier** | certified |
| **Route** | `/dashboard/kitchen` |
| **Examples** | 24\" HDMI display + mini PC · wall-mounted iPad expo · Android packing line |

Web KDS with bump, recall, and station routing. Rush-hour SLA is **BETA** — verify connection bar before service. No proprietary kitchen screen required.

<!-- category-cash_drawers -->
### 4. Cash drawers

| | |
|---|---|
| **Tier** | roadmap |
| **Route** | `/dashboard/pos/terminal` |
| **Examples** | APG Vasario · MMF Val-U-Line (manual open until printer-kick wired) |

Manual cash drawer today. Auto-open on cash sale via receipt-printer pulse is **placeholder** — do not claim printer-kick **certified**.

<!-- category-barcode_scanners -->
### 5. Barcode scanners

| | |
|---|---|
| **Tier** | certified |
| **Route** | `/dashboard/pos/handheld` |
| **Examples** | Honeywell Voyager 1470g · Zebra DS2208 · Socket Mobile S700 |

USB or Bluetooth **keyboard wedge** — focus POS search, scan sends digits + Enter. Serial scanners without wedge emulation are not supported.

<!-- category-label_printers -->
### 6. Label printers

| | |
|---|---|
| **Tier** | browser_compatible |
| **Route** | `/dashboard/packing` |
| **Examples** | Epson TM-L100 · Zebra ZD421 · Brother QL-820NWB |

Packing bag labels, allergen stickers, and expo chits via browser print. Native ZPL/EPL direct driver is **roadmap**.

<!-- category-payment_terminals -->
### 7. Payment terminals

| | |
|---|---|
| **Tier** | certified (Stripe) / external (PAX) |
| **Route** | `/dashboard/settings/hardware` |
| **Examples** | Stripe M2, WisePOS E, P400 · PAX A920 Pro (external mark-paid) |

**In-app:** Stripe Terminal pair at Settings → Payment hardware. **External:** PAX acquirer app — mark paid in POS. PAX in-app SDK is **not shipped**.

---

## Field checklist (new site)

1. Confirm register PC or **iPad** runs supported Safari/Chrome.
2. Pair keyboard-wedge **scanner** — verify one product barcode end-to-end.
3. Set **Epson or Star** receipt printer as OS default — print test receipt.
4. Mount **kitchen screen** — open KDS, verify bump on test ticket.
5. Choose payments: **Stripe Terminal** (in-app) and/or **PAX external**.
6. **Label printer** — print one packing label from `/dashboard/packing`.
7. **Cash drawer** — manual open workflow documented with staff.

---

## Forbidden hardware claims

| Do **not** say | Say instead |
|----------------|-------------|
| "Toast-class hardware bundle included" | "Browser-first — optional Stripe reader or BYOD tablet" |
| "Production-certified offline card" | "Cash queue online; card offline **not certified**" |
| "Printer-kick cash drawer live" | "Manual drawer until ESC/POS pulse ships" |
| "PAX in-app tap-to-pay" | "PAX external capture or Stripe Terminal in-app" |
| "Rush-hour KDS certified" | "Web KDS — verify connection; SLA **BETA**" |

Run `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` before hardware slides.

---

## CI

```bash
npm run audit:certified-hardware-guide
npm run test:ci:certified-hardware-guide
npm run test:ci:pos-hardware-compatibility
```

---

## Related docs

| Doc | Use |
|-----|-----|
| [`hardware-compatibility.md`](./hardware-compatibility.md) | Full device matrix + vendor models |
| [`stripe-terminal-hardware.md`](./stripe-terminal-hardware.md) | Stripe reader pairing |
| [`POS_HARDWARE_READINESS.md`](./POS_HARDWARE_READINESS.md) | Category readiness matrix |
| [`no-hardware-lock-in-positioning.md`](./no-hardware-lock-in-positioning.md) | Sales talk track |

**Compatibility center (P2-87):** [`/works-with-os-kitchen`](/works-with-os-kitchen) — printer test, cash drawer checklist, KDS connectivity, network diagnostic. See [`hardware-compatibility-center.md`](./hardware-compatibility-center.md).
