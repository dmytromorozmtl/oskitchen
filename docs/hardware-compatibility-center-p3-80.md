# Hardware compatibility center (P3-80)

**Policy:** `hardware-compatibility-center-p3-80-v1`  
**Department:** Hardware  
**Upstream:** `hardware-compatibility-center-p2-87-v1`  
**Route:** [`/works-with-os-kitchen`](/works-with-os-kitchen)  
**Registry:** [`artifacts/hardware-compatibility-center-p3-80-registry.json`](../artifacts/hardware-compatibility-center-p3-80-registry.json)

---

## Works with OS Kitchen

Public **hardware compatibility center** with 4 field diagnostics:

| Test id | Label |
|---------|-------|
| `hardware-test-printer` | Printer test (browser print dialog) |
| `hardware-test-cash-drawer` | Cash drawer checklist (placeholder kick) |
| `hardware-test-kds` | KDS connectivity |
| `hardware-test-network` | Network + `/api/health` round-trip |

Cross-refs: [`hardware-compatibility-roadmap-toast.md`](./hardware-compatibility-roadmap-toast.md) · [`certified-devices-ipad.md`](./certified-devices-ipad.md)

P3-80 certifies the public center + roadmap + certified devices triangle on top of P2-87.

---

## Verify

```bash
npm run audit:hardware-compatibility-center
npm run test:ci:hardware-compatibility-center
npm run check:hardware-compatibility-center-p3-80
npm run audit:hardware-compatibility-center-p3-80
npm run test:ci:hardware-compatibility-center-p3-80:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` (P3-80 cert audit)

---

## Status

Browser-first hardware diagnostics live at `/works-with-os-kitchen`. No proprietary terminal lease required.
