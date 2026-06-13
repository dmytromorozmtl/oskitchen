# Hardware compatibility roadmap — Toast parity baseline

**Policy:** `hardware-compatibility-roadmap-p2-37-v1`  
**Department:** Hardware  
**Blueprint task:** P2-37 — USB/Bluetooth printers + iPad counter mount vs Toast  
**Updated:** 2026-06-14  
**Registry:** [`artifacts/hardware-compatibility-roadmap-p2-37-registry.json`](../artifacts/hardware-compatibility-roadmap-p2-37-registry.json)

---

## Honest baseline (June 2026)

OS Kitchen is **not affiliated** with Toast. We have **0 signed LOIs** and **no Toast-certified hardware lease program**. This roadmap documents **browser-first** compatibility for USB/Bluetooth receipt printers and iPad counter mounts — not field-certified Toast Tap install proof.

**verify** compat center and certified hardware guide audits before outbound printer or mount claims. Native ESC/POS USB/Bluetooth drivers remain **roadmap** — today operators use OS print queues.

Cross-refs: [`toast.md`](./competitor-battle-cards/toast.md) · [`hardware-compatibility.md`](./hardware-compatibility.md) · [`certified-hardware-guide.md`](./certified-hardware-guide.md) · [`POS_HARDWARE_READINESS.md`](./POS_HARDWARE_READINESS.md) · [`lib/pos/pos-hardware.ts`](../lib/pos/pos-hardware.ts)

> Internal roadmap — not Toast-certified hardware. Browser-first POS on BYOD iPad/tablets. Native ESC/POS USB/Bluetooth drivers are roadmap items; verify compat center audits before field claims.

---

## Positioning line

> **Bring your own iPad and printers — no Toast hardware lease.**

Toast wins when operators want Toast Go handhelds, Toast Tap mounts, and certified field install. OS Kitchen wins when operators want kitchen depth on **iPad + Epson/Star printers they already own** — with Integration Health showing **BETA** vs shipped rows.

---

## Headline

> **Hardware compatibility roadmap — Toast parity baseline**

Compatibility center: [`/works-with-os-kitchen`](../app/works-with-os-kitchen/page.tsx)

---

## Toast vs OS Kitchen (6 roadmap items)

| Item ID | Toast typical | OS Kitchen path | Phase |
|---------|---------------|-----------------|-------|
| `usb_receipt_printer` | Toast-certified Epson/Star with field install | Browser print via OS driver — Epson TM-T88VI, TM-m30III, Star TSP143IV (USB) | shipped |
| `bluetooth_receipt_printer` | Toast Go + wireless receipt lanes | Pair to iPad host — Epson TM-m30III BT, Star mC-Print3; browser print today | baseline |
| `ipad_counter_mount` | Toast Tap proprietary mount + reader | BYOD iPad + Heckler / Bouncepad / Kensington stand — PWA at `/dashboard/pos/tablet` | baseline |
| `toast_go_handheld` | Toast Go 2/3 with built-in printer | Phone/tablet POS — `/dashboard/pos/handheld` + Socket Mobile S700 | shipped |
| `printer_diagnostics` | Toast field rep certified install | Works with OS Kitchen compat center — printer + drawer diagnostic tiers | shipped |
| `native_escpos_roadmap` | Day-one USB/BT driver + drawer pulse | **Roadmap** — WebUSB / StarPRNT / Epson ePOS; drawer kick **placeholder** | roadmap |

Battle card: [`toast.md`](./competitor-battle-cards/toast.md) · Compare: `/compare/toast`

---

## USB receipt printers

Browser-compatible today via OS print dialog — **no native ESC/POS USB driver shipped**.

| Vendor | Model | Role | Connection |
|--------|-------|------|------------|
| Epson | TM-T88VI | Receipt | USB |
| Epson | TM-m30III | Receipt | USB |
| Star | TSP143IV | Receipt | USB |

**Operator steps**

1. Install vendor driver on POS workstation or iPad host (where supported).
2. Set printer as system default queue.
3. Complete test sale → **Print receipt** from POS (`window.print()`).

---

## Bluetooth receipt printers

Pair to iPad/tablet counter host — same browser-print path; native Bluetooth ESC/POS is **BETA** / **roadmap**.

| Vendor | Model | Role | Connection |
|--------|-------|------|------------|
| Epson | TM-m30III | Receipt | Bluetooth |
| Star | mC-Print3 | Receipt + optional display | Bluetooth |
| Star | SM-L200 | Mobile receipt | Bluetooth |

**Operator steps**

1. Pair printer per vendor guide (Settings → Bluetooth on iPad).
2. Share printer to browser host; confirm test print from OS print dialog.
3. For mobile lanes use `/dashboard/pos/handheld` with paired BT printer.

---

## iPad counter mount / holder

Toast Tap is proprietary lease hardware — **not supported**. OS Kitchen path is BYOD iPad on third-party stands.

| Vendor | Model | Fit | Tier |
|--------|-------|-----|------|
| Heckler Design | Windfall Stand | iPad 10.9" / Pro 11" | baseline |
| Bouncepad | Floorstanding Kiosk | iPad Pro 12.9" | baseline |
| Kensington | Secure Tablet Stand | Universal tablet | baseline |
| Toast Tap | Proprietary mount + reader | Toast lease only | not supported |

**Operator steps**

1. Mount iPad per vendor instructions (counter, wall, or floor stand).
2. Open Safari → `/dashboard/pos/tablet` → Add to Home Screen (PWA).
3. Run compat center printer test before service.

---

## Roadmap phases

| Phase | What ships | Audit |
|-------|------------|-------|
| **Shipped** | USB browser print, tablet/handheld POS, compat diagnostics | `audit:hardware-compatibility-center` |
| **Baseline** | BT printer pairing + third-party iPad mounts | `audit:certified-hardware-guide` |
| **Roadmap** | Native ESC/POS USB/BT + cash-drawer pulse | **Not shipped** |

---

## Gap honesty (not Toast parity)

| Toast capability | OS Kitchen status |
|------------------|-------------------|
| Toast Tap mount + reader bundle | **Third-party stands only** — no proprietary mount |
| Toast Go built-in printer handheld | BYOD tablet/phone — external BT printer |
| Certified field install + support | Self-serve compat diagnostics |
| Thousands of in-venue references | **0 signed LOIs** |
| Day-one ESC/POS + drawer kick | **Roadmap** — browser print only |

---

## Audit commands

```bash
npm run audit:hardware-compatibility-roadmap-p2-37
npm run check:hardware-compatibility-roadmap-p2-37
npm run audit:hardware-compatibility-center
npm run audit:certified-hardware-guide
```
