# KitchenOS — UX, UI & Navigation Audit

**Date:** 2026-05-15

---

## 1. Information architecture

- **Dashboard shell:** `components/dashboard/dashboard-shell.tsx` + `command-palette.tsx`.
- **Business modes:** `lib/business-modes.ts` filters nav density for vertical relevance.
- **Risk:** Deep nav can overwhelm new owners — mitigated by setup sidebar + module preferences (**verify** onboarding analytics).

---

## 2. Major page patterns (representative)

| Module | Primary CTA expectation | Empty state | Loading |
|--------|-------------------------|-------------|---------|
| Today | “Start here” tasks / alerts | Needs clear “all clear” | Skeleton recommended (**P2**) |
| Order Hub | Open next blocker order | Queue zero-state | Table spinners |
| POS Terminal | Start sale / resume shift | Hardware settings link | Client-heavy |
| Storefront builder | Publish / preview | Draft empty | Preview banner |
| Integrations | Connect / test | `ProviderMissingState` pattern (partially via capability matrix cards) | Test spinner |
| Support inbox | Reply / triage | No tickets copy | Pagination |

---

## 3. Enum / status language

- Prefer `MappingStatusBadge`, `*StatusBadge` components over raw enum strings.
- **P2 sweep:** grep dashboard for `.status}` string interpolation in JSX.

---

## 4. Destructive actions

- Patterns: confirm dialogs in shadcn `AlertDialog`.
- **P1:** Ensure destructive server actions require **typed confirmation** + reason where legally useful (GDPR delete, demo reset).

---

## 5. Mobile / tablet

- Tailwind breakpoints used widely.
- POS terminal and packing flows should be manually tested on iPad portrait (**QA**).

---

## 6. Shared components (existing)

- `components/dashboard/empty-state.tsx` — card-based actionable empty pattern.
- `components/empty-state/actionable-empty-state.tsx` currently re-exports — **P3** consolidate naming.

**Requested additions (StatusBadge, PageHeader, etc.):** Partially exist as specialized components; avoid duplicating large new libraries unless a second consumer appears in the same sprint.

---

## 7. Fixes applied this pass

- Cleaned redundant imports on product-mapping list pages for less visual noise in devtools / faster scans.
- Support page import cleanup (no behavior change).

---

## 8. Backlog (P2/P3)

- Standardize `SetupRequiredState` component for integration pages.
- Audit duplicate nav labels between “Settings → Integrations” vs “Integrations command center” (**copy** pass).
