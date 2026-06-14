# P1-25 — Remove hardware roadmap from marketing

**Policy:** `remove-hardware-roadmap-p1-25-v1`  
**Registry:** [`artifacts/remove-hardware-roadmap-p1-25.json`](../artifacts/remove-hardware-roadmap-p1-25.json)

## Contract

Marketing and GTM materials must **not** tease proprietary hardware, native terminals, or hardware bundles as "coming soon."

**Deferred (honest):** browser-first POS on BYOD tablets, optional Stripe Terminal (BETA), browser print to Epson/Star.

**Banned phrases** (CI gate): `hardware coming soon`, `native terminal coming soon`, `packing labels roadmap`, and related variants — see `REMOVE_HARDWARE_ROADMAP_P1_25_BANNED_PHRASES`.

**Say instead:** "Native payment terminals and proprietary hardware ecosystem are deferred — use browser POS and optional Stripe Terminal (BETA) today."

## Verify

```bash
npm run check:remove-hardware-roadmap-p1-25
npm run gate:forbidden-claims
```
