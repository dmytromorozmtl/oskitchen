# Visual regression dark mode (P3-58)

**Policy:** `visual-regression-dark-mode-p3-58-v1`  
**Department:** QA  
**Registry:** [`artifacts/visual-regression-dark-mode-p3-58-registry.json`](../artifacts/visual-regression-dark-mode-p3-58-registry.json)

---

## Scope

Chromatic/Percy-style visual regression via **Playwright committed PNG baselines** — no Storybook token required.

Each of **5 visual-test fixtures** is snapshotted in **light** and **dark** (10 pairs total):

| Fixture | Path |
|---------|------|
| Theme presets | `/visual-test/theme-presets` |
| Nav tokens | `/visual-test/nav-tokens` |
| Checkout shell | `/visual-test/checkout-shell` |
| Collection preview | `/visual-test/collection-preview` |
| Dark mode parity | `/visual-test/dark-mode-parity` |

Spec: `tests/visual/dark-mode-parity.spec.ts`  
CI workflow: `.github/workflows/chromatic-visual.yml`

---

## Run locally

```bash
npm run build
npm run check:visual-regression-dark-mode-p3-58
npm run audit:visual-regression-dark-mode-p3-58
npm run test:visual:dark-mode
```

Update baselines:

```bash
npx playwright test tests/visual/dark-mode-parity.spec.ts --project=visual --update-snapshots
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml`

Optional Chromatic handoff: set `CHROMATIC_PROJECT_TOKEN` + run Storybook (not required for CI).

---

## References

- `lib/testing/visual-regression-dark-mode-policy.ts` — upstream target registry
- `tests/visual/helpers/dark-mode-theme.ts` — theme application helper
