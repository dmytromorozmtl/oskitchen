# P1-26 — SOC 2 messaging (in progress, not certified)

**Policy:** `soc2-messaging-p1-26-v1`  
**Registry:** [`artifacts/soc2-messaging-p1-26.json`](../artifacts/soc2-messaging-p1-26.json)

## Contract

Marketing, trust page, and sales one-pagers must **not** claim SOC 2 certification or compliance.

**Say instead:** "SOC 2 in progress — Type I target Q4 2026 (not certified)"

**Banned phrases** (CI gate): `SOC 2 compliant`, `SOC 2 certified`, `SOC 2 ready`, and related variants — see `SOC2_MESSAGING_P1_26_BANNED_PHRASES`.

**Roadmap reference:** [`docs/SOC2_ROADMAP_Q4.md`](./SOC2_ROADMAP_Q4.md)

## Verify

```bash
npm run check:soc2-messaging-p1-26
npm run gate:forbidden-claims
```
