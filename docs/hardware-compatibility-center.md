# Hardware compatibility center — Works with OS Kitchen

**Policy:** `hardware-compatibility-center-p2-87-v1`  
**Route:** [`/works-with-os-kitchen`](/works-with-os-kitchen)  
**Tagline:** Works with OS Kitchen  
**Headline:** Works with OS Kitchen — hardware compatibility center  
**Audience:** Operators, field techs, pilot onboarding  
**Framework:** browser-first · verify before rush · no proprietary terminal lease

Run **4 diagnostics** before service: printer test, cash drawer checklist, KDS connectivity, network round-trip.

---

## Diagnostics (4)

| Test id | Label | What it checks |
|---------|-------|----------------|
| `hardware-test-printer` | Printer test | Browser print dialog → receipt queue (Epson/Star browser_compatible) |
| `hardware-test-cash-drawer` | Cash drawer test | Manual open workflow — auto kick is **placeholder** |
| `hardware-test-kds` | KDS test | Kitchen route latency + link to `/dashboard/kitchen` |
| `hardware-test-network` | Network diagnostic | Online status + `/api/health` round-trip |

**Honesty:** Native ESC/POS USB is **placeholder**. Web KDS refresh is **BETA**. **verify** latency under 500ms **typical** for counter POS.

---

## Operator links

- POS hardware matrix → `/dashboard/pos/settings/hardware`
- Stripe Terminal pairing → `/dashboard/settings/hardware`
- Kitchen display (KDS) → `/dashboard/kitchen`
- Certified hardware guide → [`certified-hardware-guide.md`](./certified-hardware-guide.md)

---

## CI

```bash
npm run audit:hardware-compatibility-center
npm run test:ci:hardware-compatibility-center
```

Wired in `.github/workflows/deploy-prod-gate.yml`.

---

## Related docs

| Doc | Use |
|-----|-----|
| [`certified-hardware-guide.md`](./certified-hardware-guide.md) | 7-category procurement guide (P2-86) |
| [`hardware-compatibility.md`](./hardware-compatibility.md) | Full device matrix |
| [`POS_HARDWARE_READINESS.md`](./POS_HARDWARE_READINESS.md) | Category readiness |
