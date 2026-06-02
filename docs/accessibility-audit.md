# Accessibility audit — axe-core results

**Date:** 2026-06-02  
**Target:** WCAG 2.1 AA on revenue-critical public paths  
**Tooling:** `@axe-core/playwright` 4.11.3 (axe-core 4.11.x)  
**Disclaimer:** Automated scan only — not a legal compliance certification or substitute for manual assistive-tech testing.

---

## Scope

| Layer | Routes | Enforced in CI |
|-------|--------|----------------|
| Marketing | `/`, `/pricing`, `/roi-calculator`, `/book-demo`, `/compare/toast`, `/compare/deliverect`, `/solutions/meal-prep`, `/blog/meal-prep-order-queue-cut-packing-errors`, `/deck` | Yes — `tests/e2e/a11y-marketing.spec.ts` |
| Auth shell | `/login`, `/signup`, `/forgot-password` | Yes — `tests/e2e/a11y-auth-shell.spec.ts` |
| Dashboard / POS / KDS | Not scanned in this pass | Manual + future Task 77 (`e2e/accessibility.spec.ts`) |

**WCAG tags scanned:** `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`

**CI gate:** serious + critical violations must be **0** (see `.github/workflows/ci.yml` — runs after `npm run build` + `next start` with `CI=1`).

---

## How to reproduce

```bash
# Production-like path (matches CI)
npm run build
CI=1 CRON_SECRET=ci-test-secret \
  UPSTASH_REDIS_REST_URL=https://example.upstash.io \
  UPSTASH_REDIS_REST_TOKEN=ci-test-token \
  npm run start -- -p 3000 &
# wait for http://127.0.0.1:3000/login
npm run test:e2e:a11y
./node_modules/.bin/playwright test tests/e2e/a11y-auth-shell.spec.ts --project=chromium
```

Local dev (`npm run dev`) was used for the baseline sweep below; dev HMR and unoptimized CSS can differ from production builds — treat CI as the release gate.

---

## axe-core sweep — 2026-06-02 (12 routes)

**Environment:** `next dev` @ `http://127.0.0.1:3000`  
**Totals:** 3 critical · 15 serious · 0 moderate · 0 minor

| Route | Critical | Serious | Passes | Top rules |
|-------|----------|---------|--------|-----------|
| `/` | 0 | 1 | 23 | `color-contrast` (15 nodes) |
| `/pricing` | 2 | 1 | 28 | `button-name`, `label`, `color-contrast` |
| `/roi-calculator` | 0 | 1 | 25 | `color-contrast` |
| `/book-demo` | 1 | 1 | 27 | `button-name`, `color-contrast` |
| `/compare/toast` | 0 | 1 | 26 | `color-contrast` |
| `/compare/deliverect` | 0 | 1 | 26 | `color-contrast` |
| `/solutions/meal-prep` | 0 | 1 | 26 | `color-contrast` |
| `/blog/meal-prep-order-queue-cut-packing-errors` | 0 | 1 | 24 | `color-contrast` |
| `/deck` | 0 | 1 | 25 | `color-contrast` |
| `/login` | 0 | 2 | 25 | `color-contrast`, `link-in-text-block` |
| `/signup` | 0 | 2 | 27 | `color-contrast`, `link-in-text-block` |
| `/forgot-password` | 0 | 2 | 25 | `color-contrast`, `link-in-text-block` |

### Violation summary by rule

| Rule ID | Impact | Occurrences (routes) | Help |
|---------|--------|----------------------|------|
| `color-contrast` | serious | 12/12 | Elements must meet minimum color contrast ratio thresholds |
| `link-in-text-block` | serious | 3/12 | Links must be distinguishable without relying on color |
| `button-name` | critical | 2/12 | Buttons must have discernible text |
| `label` | critical | 1/12 | Form elements must have labels |

---

## Findings & remediation backlog

### P0 — blocks CI gate if present in production build

1. **`/pricing` — unlabeled form controls (8 nodes) + icon-only button**  
   - Fix: associate `<Label>` / `aria-label` on tier toggles and billing inputs; add accessible name to plan-comparison icon buttons.

2. **`/book-demo` — button without discernible text (1 node)**  
   - Fix: add visible text or `aria-label` on calendar/submit icon buttons.

3. **`color-contrast` — muted foreground on marketing surfaces (all 12 routes)**  
   - Fix: audit `text-muted-foreground`, badge, and CTA tokens on colored backgrounds; pair status with icons/text (see `docs/ACCESSIBILITY_REVIEW.md`).

### P1 — auth shell

4. **`link-in-text-block` on `/login`, `/signup`, `/forgot-password`**  
   - Fix: underline or weight contrast on inline “Sign up” / “Forgot password” links inside body copy.

### P2 — operator surfaces (out of automated scope)

- Dashboard dense tables, modals, command palette — keyboard trap audit (Radix/shadcn).
- POS/KDS touch targets — covered by `tests/unit/pos-touch-targets.test.ts` (48px buttons, 120px tiles).
- KDS overdue tickets — `aria-label` + visual/audio cues documented in `docs/QA_ACCESSIBILITY_POS_KDS.md`.

---

## Existing strengths

- Semantic headings on auth and marketing pages.
- Skip-to-content component (`components/a11y/skip-to-content.tsx`).
- Collapsible dashboard nav with visible labels.
- POS touch-target constants enforced in unit tests (`lib/pos/touch-targets.ts`).
- KDS overdue state includes `aria-label` and non-color cues.

---

## Related docs & tests

| Asset | Purpose |
|-------|---------|
| `docs/ACCESSIBILITY_REVIEW.md` | Pattern-level recommendations |
| `docs/QA_ACCESSIBILITY_POS_KDS.md` | POS/KDS gates and manual QA |
| `docs/NAVIGATION_ACCESSIBILITY_REVIEW.md` | Sidebar / command palette |
| `tests/e2e/a11y-marketing.spec.ts` | CI marketing axe gate |
| `tests/e2e/a11y-auth-shell.spec.ts` | CI auth shell axe gate |
| `tests/unit/pos-touch-targets.test.ts` | WCAG 2.5.5 touch targets |

---

## Next steps

1. Fix P0 items on `/pricing` and `/book-demo`; re-run `npm run test:e2e:a11y` against production build.
2. Token pass on `muted-foreground` / badge contrast (cross-route `color-contrast` cleanup).
3. Before enterprise pilot: VoiceOver spot check on `/dashboard/pos/terminal` and `/dashboard/kitchen` (manual, authed).
4. Task 77: add `e2e/accessibility.spec.ts` with axe-core for broader route coverage in CI.
