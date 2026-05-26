# Accessibility — POS, KDS, Marketing

**Target:** WCAG 2.1 AA on revenue paths before enterprise GTM.  
**Not a substitute** for a formal third-party audit.

---

## Automated gates (CI)

| Gate | Command | Scope |
|------|---------|--------|
| Marketing axe | `npm run test:e2e:a11y` | Homepage, pricing, ROI, book-demo, compare, meal-prep solution, featured blog, `/deck` |
| CI integration | `.github/workflows/ci.yml` | Runs a11y spec after `next start` alongside platform-access E2E |
| Touch target unit | `tests/unit/pos-touch-targets.test.ts` | `lib/pos/touch-targets.ts` — 48px buttons, 120px product tiles |

---

## POS touch targets

**Standard:** `lib/pos/touch-targets.ts`

| Class | Use | Min size |
|-------|-----|----------|
| `posTouchButtonClass` | Quick-order grids, bar tab quick-add | 48×48px |
| `posTouchTileClass` | Product tiles on terminal | 120px height |
| `posTouchCompactClass` | Customer search results, secondary taps | 44×44px |

**Wired in:**

- `components/pos/quick-order-buttons.tsx`
- `components/pos/tab-panel.tsx`
- `components/dashboard/pos-terminal-client.tsx`

Manual QA: wet/gloved hands on iPad — confirm no mis-taps on adjacent tiles.

---

## KDS overdue (food safety)

**File:** `components/kitchen/kds-daily-service.tsx`

- Visual: `ring-rose-500` + `animate-pulse` (respects `motion-reduce`)
- Audio: Web Audio beep once per ticket when SLA exceeded
- ARIA: `aria-label` includes "overdue"

---

## Before enterprise pilot

1. Run `npm run test:e2e:a11y` locally against production build
2. axe DevTools on `/dashboard/pos/terminal` (authed) — document violations
3. File issues for color-only status outside KDS (if any)
