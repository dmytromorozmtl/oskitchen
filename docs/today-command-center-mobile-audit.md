# Today Command Center — mobile audit

**Date:** 2026-06-02  
**Route:** `/dashboard/today`  
**Primary UI:** `components/dashboard/today-command-center.tsx`  
**Page shell:** `app/dashboard/today/page.tsx` (briefing, launch wizard, checklists stack above core view)  
**Method:** Static responsive-class audit + layout review against Tailwind breakpoints (`sm` 640, `md` 768, `lg` 1024, `xl` 1280). No automated viewport screenshot suite yet.

---

## Executive summary

| Metric | Result |
|--------|--------|
| **Mobile readiness score** | **78 / 100** — stacks correctly; scroll depth and action density are the main gaps |
| **Layout regressions** | None blocking — grids collapse to single column as designed |
| **Touch / tap targets** | Mostly OK on `Button`; a few icon-only controls below 44×44 px |
| **Owner briefing mode** | **Better on mobile** — KPI wall collapses, attention strip hidden, readiness compact |
| **Automated mobile E2E** | **Missing** — `tests/e2e/pilot-journey.spec.ts` loads Today on desktop viewport only |

**Verdict:** Ship-safe for pilot operators on phone/tablet for **scan-and-act** workflows (attention strip, blockers, quick jumps). Not yet optimized for **full KPI wall review** on 320–390 px widths without `?metrics=all` intent.

---

## Scope

### In scope

| Layer | File(s) | Mobile relevance |
|-------|---------|------------------|
| Dashboard chrome | `components/dashboard/dashboard-shell.tsx` | Sheet nav, sticky header, `px-4 pb-24` main padding |
| Page orchestration | `app/dashboard/today/page.tsx` | Vertical stack of 6–10 hero strips before core view |
| Core view | `components/dashboard/today-command-center.tsx` | KPI grid, readiness, queues, quick jumps |
| Attention | `components/dashboard/today-attention-strip.tsx` | Amber alert card — full width |
| Labor | `components/labor/labor-realtime-widget.tsx` | Polls `/api/labor/realtime` — full-width card |
| Playbooks | `components/dashboard/playbooks/playbook-today-strip.tsx` | Recommended + active runs |
| Briefing (owner) | `components/dashboard/owner-daily-briefing-hero.tsx` | Replaces focus — mobile-aware grids |
| Launch wizard strip | `components/dashboard/launch-wizard/launch-wizard-today-strip.tsx` | Owner-only — `sm:flex-row` actions |

### Out of scope (this pass)

- KDS / kitchen tablet layouts (`/dashboard/kitchen`)
- Marketing landing pages
- axe-core contrast (see `docs/accessibility-audit.md`)

---

## Viewport matrix

| Viewport | Width | Expected layout | Status |
|----------|------:|-----------------|--------|
| iPhone SE | 320 | Single-column cards; KPI 2-up when expanded | ⚠️ Action wrap tight |
| iPhone 14 | 390 | Same; header buttons 2-row wrap | ✅ Usable |
| Pixel / Android | 412 | Same as 390 | ✅ Usable |
| iPad portrait | 768 | KPI 2-up → 4-up at `lg`; side-by-side blockers at `lg` | ✅ Good |
| iPad landscape / laptop | 1024+ | Full multi-column KPI wall (`lg:grid-cols-4`, `xl:grid-cols-5`) | ✅ Good |

---

## Responsive breakpoint inventory

Source: `components/dashboard/today-command-center.tsx`

| Section | Mobile (<640) | `sm` (≥640) | `lg` (≥1024) | Notes |
|---------|---------------|-------------|--------------|-------|
| Page header | `flex-col` | — | `md:flex-row` title vs actions | Actions wrap below title |
| Readiness categories | 1 col | `sm:grid-cols-2` | `lg:grid-cols-3` | Tap targets on category links OK |
| KPI wall (expanded) | 1 col | `sm:grid-cols-2` | `lg:grid-cols-4`, `xl:grid-cols-5` | Up to **20 tiles** → long scroll |
| Blockers + Go-live | 1 col | — | `lg:grid-cols-2` | Stacks until tablet landscape |
| Orders / tasks / routes | 1 col | — | `lg:grid-cols-3` | Three full cards stacked on phone |
| Live activity + presence | 1 col | — | `lg:grid-cols-2` | |
| Quick jumps | 1 col | `sm:grid-cols-2` | `lg:grid-cols-4` | Large touch buttons (`py-4`) |

### Focus / collapse policies (mobile-friendly)

| Policy | Trigger | Mobile effect |
|--------|---------|---------------|
| `shouldCollapseTodayKpiWall` | Quiet shift + `metrics !== all` | KPI wall hidden — **reduces scroll** |
| `shouldCollapseTodayMetricsForBriefing` | Owner briefing active | Same — briefing hero carries snapshot |
| `shouldCompactTodayReadinessForBriefing` | Owner briefing + collapsed metrics | Readiness → compact card with 2 CTAs |
| `shouldHideTodayAttentionStripForBriefing` | Owner briefing | Attention strip removed (dedupe) |
| `isTodayShiftQuiet` | Zero blockers + low KPI signals | “Everything is calm” card with starter CTAs |

---

## Section-by-section findings

### 1. Dashboard shell (shared)

| Check | Result |
|-------|--------|
| Navigation | ✅ Hamburger sheet (`lg:hidden`) — 280 px drawer |
| Header density | ⚠️ Command palette + theme + account on one row — crowded on 320 px |
| Content padding | ✅ `main`: `px-4 py-8 pb-24 sm:px-8` — bottom pad for thumb reach |
| Breadcrumbs | Hidden below `sm` — acceptable for home-style Today page |

### 2. Page stack above core view (owner / new workspace)

When **owner briefing** or **getting started** strips render, mobile scroll depth increases by **4–6 viewport heights** before the operator reaches KPIs.

| Strip | Mobile behavior | Issue |
|-------|-----------------|-------|
| `PilotIntegrationHealthStrip` | Full-width cards | P1 — adds vertical noise |
| `OwnerDailyBriefingHero` | `grid-cols-2` metric tiles at base | ✅ Readable |
| `LaunchWizardTodayStrip` | `flex-col` → `sm:flex-row` | ✅ |
| `GettingStartedChecklist` | Expandable steps | P2 — long for day-1 users |
| `AiBriefingPanel` | Full-width | OK |

**Recommendation:** Add a “Jump to operations” anchor link in briefing hero for mobile (Task backlog below).

### 3. Header + primary actions

```74:108:components/dashboard/today-command-center.tsx
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        ...
        <div className="flex flex-wrap gap-2">
          ...
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard">Classic dashboard</Link>
          </Button>
          ...
        </div>
      </div>
```

| Check | Result |
|-------|--------|
| Title (`text-3xl`) | ✅ Legible; wraps with mode badge |
| Action cluster | ⚠️ Up to **4 outline pills** wrap to 2+ rows on 320 px |
| Briefing toggle | ✅ `data-testid="today-briefing-metrics-toggle"` — testable |

**P1:** Collapse secondary header links (“Classic dashboard”, “Error recovery”, “System health”) into a **“More”** `DropdownMenu` below `md`.

### 4. Attention strip

| Check | Result |
|-------|--------|
| Layout | ✅ Full-width card, stacked link rows |
| Tap rows | ✅ `rounded-xl px-3 py-2` — adequate height |
| Contrast (amber) | ⚠️ See accessibility audit — dark mode border OK |

### 5. Workspace readiness

| Mode | Mobile |
|------|--------|
| Full | Category grid 1 → 2 → 3 cols; progress bar full width |
| Compact (briefing) | Single card + 2 buttons — **preferred mobile density** |

No issues beyond scroll length in full mode (6–9 category tiles).

### 6. Inventory shortage readiness

| Check | Result |
|-------|--------|
| Stat chips + buttons | `flex flex-wrap gap-2` — wraps cleanly |
| CTA count | 2 outline buttons — OK |

### 7. KPI wall (when expanded)

| Check | Result |
|-------|--------|
| Tile readability | ✅ Title `text-xs`, value `text-2xl` |
| Tile count | ⚠️ **20 KPI cards** on phone = ~10 screen heights |
| Per-tile link | Small `Open →` text link — **P2** tap target |
| Revenue tiles | `text-lg` — OK |

**P1:** Default mobile to collapsed wall unless `?metrics=all` or user opts in (extend era18 policy with `max-sm` hint).

### 8. Blockers + go-live row

| Check | Result |
|-------|--------|
| Blocker links | ✅ Full-width tappable rows |
| Go-live button group | `flex-wrap` — 4 buttons wrap on narrow screens |

### 9. Orders / tasks / routes triple column

| Check | Result |
|-------|--------|
| Stacking | ✅ Single column until `lg` |
| Row links | ✅ Order customer name truncates |
| Empty copy | Plain `<p>` — OK |

### 10. Playbooks strip

| Check | Result |
|-------|--------|
| Title row | `flex justify-between` — “Open command center →” may squeeze title on 320 px |
| Buttons | `flex-wrap gap-2` — OK |

**P2:** Stack title and “Open command center” link vertically below `sm`.

### 11. Live activity + presence

| Check | Result |
|-------|--------|
| Layout | Stacks on mobile |
| Honest copy | “no live websocket feed yet” — OK |

### 12. Quick jumps

| Check | Result |
|-------|--------|
| Touch targets | ✅ `py-4 rounded-2xl` buttons — best mobile pattern on page |
| Grid | 1 → 2 → 4 columns |

**Recommendation:** Consider moving Quick jumps **above** KPI wall on `max-lg` (operators on phone prioritize navigation).

### 13. Labor realtime widget

| Check | Result |
|-------|--------|
| `compact` prop | **Not used** on Today — full card always |
| Loading | `h-32` pulse skeleton — OK |

**P2:** Pass `compact` on viewports `<md` or when briefing active.

### 14. Changelog banner

| Check | Result |
|-------|--------|
| Dismiss control | Icon-only `X` at `right-3 top-3` — **P2** ~16 px icon, below 44 px guideline |
| Content | `line-clamp-2` — OK |

---

## Priority backlog

### P0 — none

No layout breaks that hide critical actions or cause horizontal overflow in code review.

### P1 — pilot polish (next sprint)

1. **Header action overflow** — dropdown for secondary Today links on `max-md`.
2. **KPI wall scroll fatigue** — default collapsed on `max-sm` unless query param set; persist preference in `localStorage`.
3. **Briefing stack depth** — sticky “Operations” jump link after briefing hero.
4. **Mobile E2E** — add `tests/e2e/today-mobile.spec.ts` at 390×844 with assertions on attention strip + quick jumps visibility.

### P2 — nice to have

1. Compact labor widget on small screens.
2. Playbook header stack on narrow widths.
3. Enlarge changelog dismiss hit area (`p-2` min).
4. KPI tile “Open →” as full-width ghost button on `max-sm`.
5. Re-order sections: Quick jumps before KPI wall on mobile via `order-*` utilities.

---

## Test coverage

| Test | Viewport | Covers Today mobile? |
|------|----------|----------------------|
| `tests/e2e/pilot-journey.spec.ts` | Desktop default | Partial — “today overview loads” only |
| `tests/unit/today-command-center-focus-era18.test.ts` | N/A (logic) | Collapse policies — not viewport |
| `tests/e2e/a11y-marketing.spec.ts` | Desktop | No |
| **Gap** | 390×844 | **No dedicated Today mobile spec** |

### Suggested Playwright snippet

```bash
./node_modules/.bin/playwright test tests/e2e/today-mobile.spec.ts --project=chromium
```

```typescript
// tests/e2e/today-mobile.spec.ts (proposed)
test.use({ viewport: { width: 390, height: 844 } });
test("today quick jumps visible without horizontal scroll", async ({ page }) => {
  await page.goto("/dashboard/today");
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kitchen screen" })).toBeVisible();
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
});
```

---

## Manual QA checklist

Use Chrome DevTools device toolbar or real device logged into staging.

- [ ] 390 px: open `/dashboard/today` — no horizontal scroll
- [ ] Tap hamburger → sidebar closes on nav
- [ ] Attention strip rows navigate correctly
- [ ] Quick jumps: all 7 links reachable with thumb
- [ ] Owner account: briefing hero visible; KPI wall collapsed by default
- [ ] `?metrics=all`: KPI grid 2 columns, scrollable
- [ ] Quiet workspace: “Everything is calm” card + create order CTA
- [ ] Dark mode: attention strip amber border readable

---

## Related docs

- `docs/TODAY_COMMAND_CENTER.md` — feature scope
- `docs/accessibility-audit.md` — WCAG on public routes (dashboard not scanned)
- `docs/reportjune2.md` §6 — button-by-button Today audit (desktop-oriented)
- `lib/today/today-command-center-focus-era18.ts` — collapse policy source

---

## Changelog

| Date | Author | Notes |
|------|--------|-------|
| 2026-06-02 | 122-task executor (Task 44) | Initial mobile audit from static analysis |
