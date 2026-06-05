# POS — Hardware Readiness

Source of truth: `lib/pos/pos-hardware.ts` and `/dashboard/pos/settings/hardware`.  
Certified device catalog: [`hardware-compatibility.md`](./hardware-compatibility.md) · `lib/pos/pos-hardware-certification.ts`.

| Category | Status | Notes |
| --- | --- | --- |
| Barcode scanner (keyboard wedge) | supported | Focus search field; scanner types digits + Enter. |
| Receipt printer (browser print) | supported | Use OS print dialog; no raw ESC/POS driver. |
| Kitchen / chit printer | planned | Same browser print path until native adapter ships. |
| Cash drawer kick | placeholder | Needs printer pulse integration. |
| Customer display | placeholder | Secondary display not implemented. |
| Stripe Terminal | placeholder | No live SDK wiring; do not claim in-product copy. |
| Epson / Star native | future | Adapter roadmap item. |

Update this matrix when integrations graduate from placeholder → supported.
