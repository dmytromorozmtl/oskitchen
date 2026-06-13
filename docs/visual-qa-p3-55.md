# Visual QA (P3-55)

**Policy:** `visual-qa-p3-55-v1`  
**Department:** QA  
**Registry:** [`artifacts/visual-qa-p3-55-registry.json`](../artifacts/visual-qa-p3-55-registry.json)

---

## Scope

Playwright visual QA for three operator-critical surfaces:

| Surface | Fixture | Viewport |
|---------|---------|----------|
| **POS tablet** | `/visual-test/pos-tablet` | 1024×768 |
| **KDS kitchen screen** | `/visual-test/kds-kitchen` | 1280×800 |
| **Mobile Today** | `/visual-test/mobile-today` | 390×844 |

Isolated visual-test pages use static shell components — no auth or live data required.

---

## Run

```bash
npm run check:visual-qa-p3-55
npm run audit:visual-qa-p3-55
npm run test:visual:qa-p3-55
npm run test:visual:qa-p3-55:update   # regenerate PNG baselines
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml`
