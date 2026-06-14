# P1-30 — Self-serve onboarding (Square parity)

**Policy:** `self-serve-onboarding-p1-30-v1`  
**Registry:** [`artifacts/self-serve-onboarding-p1-30.json`](../artifacts/self-serve-onboarding-p1-30.json)

## Contract

New workspaces must reach a first order with **zero sales touch**:

1. **Registration** — signup redirects to `/dashboard/quick-start` (not the long onboarding wizard)
2. **Menu** — cuisine template + optional custom items
3. **Integrations** — channel picker (POS, QR, storefront, delivery apps) with links to Sales channels / Integration Health; connect optional
4. **First order** — POS terminal opens with confetti on completion

Selected channels flow through `applyQuickStartAction` and `finishQuickStartAction` to enable the correct modules.

## Verify

```bash
npm run check:self-serve-onboarding-p1-30
```
