# Typography audit — OS Kitchen

**Generated:** 2026-06-02 · **Scope:** `app/`, `components/`, `app/globals.css`, `tailwind.config.ts`

This audit inventories font families, type scale, weight usage, and semantic-heading drift across the 770-route surface. Use it with `docs/component-library.md` and upcoming `docs/status-color-tokens.md`.

---

## Executive summary

| Finding | Status |
|---------|--------|
| Font pairing (Syne + DM Sans) | Consistent at root |
| Body default | 16px / 400 / line-height 1.6 |
| Dashboard density | Heavy `text-sm` + `text-xs` (expected) |
| Page titles | Split between `PageHeader` (`text-3xl`) and raw headings |
| Marketing hero scale | Uses `text-4xl`–`text-6xl`; base `h1` is 72px when unstyled |
| Muted copy | `text-muted-foreground` dominant (4,532 uses) |
| Display font utility | Underused (`font-display` × 11) — globals.css auto-applies on large semibold titles |
| WCAG contrast | See `docs/accessibility-audit.md` — muted orange/gray pairs flagged on marketing |

**Verdict:** Typography foundation is solid. Primary risk is **inconsistent page-title sizing** (semantic `h1` vs Tailwind utilities) and **marketing contrast** on accent/muted pairs — not missing tokens.

---

## Font families

Loaded in `app/layout.tsx` via `next/font/google`:

| Role | Family | Weights loaded | CSS variable | Tailwind |
|------|--------|----------------|--------------|----------|
| Display / headings | **Syne** | 600, 700, 800 | `--font-display` | `font-display` |
| Body / UI | **DM Sans** | 400, 500, 600 | `--font-body` | `font-sans` (default) |
| Monospace | System stack | — | `--font-mono` | ad hoc |

Fallbacks in `app/globals.css`: Syne → system-ui; DM Sans → system-ui / -apple-system.

**Rule:** Body copy and form controls use DM Sans. Headings (`h1`–`h6`), logo wordmark, and large marketing titles use Syne. Globals also promote Syne on `.text-2xl.font-semibold` through `.text-5xl.font-bold` without requiring `font-display`.

---

## Type scale (design tokens)

Defined in `:root` (`app/globals.css`):

| Token | Size | px @ 16px root | Typical use |
|-------|------|----------------|-------------|
| `--text-xs` | 0.75rem | 12 | Badges, table meta, filter labels |
| `--text-sm` | 0.875rem | 14 | Dashboard default, buttons, dense tables |
| `--text-base` | 1rem | 16 | Body, form descriptions |
| `--text-lg` | 1.125rem | 18 | Subheads, card intros |
| `--text-xl` | 1.25rem | 20 | Section titles, `h4` |
| `--text-2xl` | 1.5rem | 24 | KPI values, module titles |
| `--text-3xl` | 1.875rem | 30 | Dashboard page titles (`PageHeader`) |
| `--text-4xl` | 2.25rem | 36 | Marketing section heads |
| `--text-5xl` | 3rem | 48 | Landing heroes, `h2` base |
| `--text-6xl` | 3.75rem | 60 | Hero headlines |
| `--text-7xl` | 4.5rem | 72 | Semantic `h1` (marketing pages without overrides) |

### Line height

| Token | Value | Use |
|-------|------:|-----|
| `--leading-tight` | 1.1 | Display headings |
| `--leading-snug` | 1.3 | Compact cards |
| `--leading-normal` | 1.6 | Body (default) |
| `--leading-relaxed` | 1.75 | Paragraphs (`p` tag) |

### Letter spacing

| Token | Value | Use |
|-------|-------|-----|
| `--tracking-tight` | -0.02em | Display (also -0.03em on headings) |
| `--tracking-normal` | 0 | Body |
| `--tracking-wide` | 0.02em | Uppercase labels |
| `--tracking-wider` | 0.1em | KPI labels, status pills |

---

## Semantic HTML defaults

From `@layer base` in `globals.css`:

```css
h1 { font-size: var(--text-7xl); }   /* 72px — very large if not overridden */
h2 { font-size: var(--text-5xl); }   /* 48px */
h3 { font-size: var(--text-3xl); }   /* 30px */
h4 { font-size: var(--text-xl); }    /* 20px */
```

All headings: Syne, weight 700, `letter-spacing: -0.03em`, `line-height: 1.1`.

**Implication:** Dashboard pages should prefer `PageHeader` (explicit `text-3xl font-semibold`) over bare `<h1>` to avoid 72px titles. Marketing pages override with Tailwind (`text-4xl md:text-6xl`).

---

## Tailwind usage scan (2026-06-02)

Static scan of `app/**/*.tsx` + `components/**/*.tsx`:

### Font sizes (occurrences)

| Class | Count | Share of typed text |
|-------|------:|--------------------:|
| `text-sm` | 3,628 | 39% |
| `text-xs` | 2,993 | 32% |
| `text-base` | 940 | 10% |
| `text-lg` | 607 | 7% |
| `text-2xl` | 597 | 6% |
| `text-3xl` | 334 | 4% |
| `text-xl` | 85 | <1% |
| `text-4xl` | 49 | <1% |
| `text-5xl` | 21 | <1% |
| `text-6xl` | 3 | rare |
| `text-7xl`+ | 0 | unused in TSX |

### Font weights

| Class | Count |
|-------|------:|
| `font-medium` | 1,969 |
| `font-semibold` | 1,362 |
| `font-normal` | 144 |
| `font-bold` | 86 |

### Other

| Pattern | Count | Notes |
|---------|------:|-------|
| `text-muted-foreground` | 4,532 | Primary secondary copy color |
| `tracking-tight` | 614 | Often paired with titles |
| `tracking-wide` | 237 | Uppercase KPI labels |
| `font-display` | 11 | Prefer globals auto-rule or heading tags |

---

## Recommended type roles

Use this matrix for new surfaces. Existing code may drift — normalize opportunistically.

| Role | Size | Weight | Font | Example component |
|------|------|--------|------|-------------------|
| Marketing hero | `text-4xl md:text-6xl` | `font-bold` | Syne (auto) | `components/landing/hero-section.tsx` |
| Page title (dashboard) | `text-3xl` | `font-semibold` | Syne | `PageHeader` |
| Section title | `text-lg`–`text-xl` | `font-semibold` | Syne or body | Card titles |
| Body | `text-sm`–`text-base` | `font-normal` | DM Sans | Form copy, descriptions |
| Dense table | `text-sm` | `font-normal` | DM Sans | `orders-table.tsx` |
| Meta / caption | `text-xs` | `font-medium` | DM Sans | Timestamps, filter counts |
| KPI value | `text-2xl` | `font-semibold` + `tabular-nums` | DM Sans | `KpiCard` |
| KPI label | `text-xs uppercase tracking-wide` | `font-medium` | DM Sans | `KpiCard` |
| Status badge | `text-xs` or `text-[10px]` | `font-semibold uppercase` | DM Sans | `BetaBadge`, `OperationalStateBadge` |
| Empty state title | `CardTitle` default | `font-semibold` | Syne via Card | `EmptyState` |
| Mobile marketplace | `text-sm` + touch classes | `font-medium` | DM Sans | `MARKETPLACE_TOUCH_*` |

---

## Surface-specific notes

### Dashboard (566 routes)

- Default density: **14px body** (`text-sm`) with **12px meta** (`text-xs`).
- `PageHeader` standardizes titles at **30px** — do not add competing `h1` styles on the same page.
- Command centers (`today-command-center.tsx`, `food-cost-dashboard.tsx`) mix `text-2xl` KPIs with `text-xs` hints — pattern is consistent.

### Marketplace

- Product cards: title `text-base`/`text-lg`, price `font-semibold`, vendor `text-xs text-muted-foreground`.
- Comparison table: row labels `text-xs uppercase tracking-wide` — matches status token plan.
- Mobile shell uses shared touch typography from `lib/marketplace/mobile-ui.ts`.

### Marketing / ICP

- Heroes stack responsive sizes; Syne applied via globals on large semibold classes.
- **Contrast debt:** axe-core flagged `color-contrast` on `/`, `/pricing`, compare pages — often `text-muted-foreground` on warm backgrounds or orange-on-white CTAs. Track in accessibility backlog (Task 89).

### Storefront (guest)

- Theme builder can override `--sb-font-body`; tenant storefronts may diverge from OS Kitchen dashboard fonts — intentional white-label path.

---

## Drift & inconsistencies

| Issue | Severity | Example | Fix |
|-------|----------|---------|-----|
| Bare `<h1>` without size override | Medium | Legacy pages inherit 72px | Use `PageHeader` or `text-3xl` |
| `text-xl` underused vs semantic `h4` | Low | 85 vs many CardTitle defaults | Prefer CardTitle for sections |
| `font-bold` vs `font-semibold` on titles | Low | Mixed across modules | Standardize on `semibold` for dashboard |
| `font-display` rarely explicit | Low | 11 uses | Rely on heading tags or globals rule |
| Uppercase labels without `tracking-wide` | Low | Some badges | Add `tracking-wide` for legibility |
| Inline `style={{ fontSize }}` | Low | Rare in platform panels | Replace with Tailwind scale |

---

## Dark mode

- shadcn tokens in `.dark` adjust `--foreground` / `--muted-foreground`.
- Amber honesty banners (kitchen camera, BETA badge) use explicit light/dark pairs — typography inherits correctly.
- `.dark-section` swaps text to `--dark-text` / `--dark-text-muted` for marketing bands.

**Audit action (Task 91):** Full dark-mode typography pass deferred to `docs/dark-mode-audit.md`.

---

## Accessibility

- Minimum interactive text: prefer **14px (`text-sm`)** on mobile; marketplace touch targets already 44px height.
- Tabular numbers: use `tabular-nums` on KPIs and financial tables (partial adoption — extend when touching files).
- Heading order: ensure single logical `h1` per page; `PageHeader` renders `h1` — nested pages should use `h2` in cards.

Cross-reference: `docs/accessibility-audit.md`, `docs/today-command-center-mobile-audit.md`.

---

## Recommendations (priority)

1. **P0 — Page title contract:** All dashboard pages use `PageHeader` with `text-3xl font-semibold tracking-tight`. No unstyled `<h1>`.
2. **P1 — KPI typography:** Document `tabular-nums text-2xl font-semibold` + `text-xs uppercase tracking-wide text-muted-foreground` label in shared `KpiCard` only.
3. **P1 — Marketing contrast:** Fix muted text on orange/ cream sections flagged by axe (links to accessibility audit).
4. **P2 — Token file:** Optional `lib/typography-tokens.ts` mirroring CSS vars for programmatic charts/PDF exports.
5. **P2 — Lint:** Future ESLint rule to warn on bare `<h1>` in `app/dashboard/**` without `text-*` class.

---

## Regeneration

Re-run the usage scan:

```bash
python3 - <<'PY'
import re, pathlib
sizes = ['xs','sm','base','lg','xl','2xl','3xl','4xl','5xl','6xl']
counts = {s:0 for s in sizes}
for p in list(pathlib.Path('components').rglob('*.tsx')) + list(pathlib.Path('app').rglob('*.tsx')):
    t = p.read_text(encoding='utf-8', errors='ignore')
    for s in sizes:
        counts[s] += len(re.findall(rf'\\btext-{s}\\b', t))
for s,v in sorted(counts.items(), key=lambda x:-x[1]):
    print(f'text-{s}: {v}')
PY
```

---

## Related docs

| Doc | Topic |
|-----|-------|
| `docs/component-library.md` | Component-level typography usage |
| `docs/status-color-tokens.md` | LIVE/BETA badge text sizes (planned) |
| `docs/accessibility-audit.md` | Contrast failures |
| `app/globals.css` | Canonical CSS variables |
| `app/layout.tsx` | Font loading |
