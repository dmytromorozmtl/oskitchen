# Status color tokens — OS Kitchen

**Updated:** 2026-06-02 · **Scope:** Integration maturity, smoke proof, and GO/NO-GO vocabulary

Canonical palette for **LIVE · BETA · PLACEHOLDER · SKIPPED · PASS · NO-GO**. These tokens enforce honest product status in UI, sales decks, and CI artifacts — never treat SKIPPED as PASS.

Related: `docs/feature-maturity-matrix.md`, `docs/typography-audit.md`, `lib/status/status-colors.ts`

---

## Design principles

1. **Green is earned** — LIVE and PASS use emerald only after staging smoke or health verification.
2. **Amber = caution** — BETA, PLACEHOLDER, SKIPPED, and warnings share the amber family (distinct label text).
3. **Red = block** — NO-GO, FAILED, and ERROR use destructive/rose — not orange.
4. **Neutral = unknown** — Pending, not run, or roadmap uses muted/zinc — not green.
5. **Dark mode parity** — Every token includes `dark:` text pairs (see `OperationalStateBadge`, `BetaBadge`).

---

## Primary status tokens (6)

| Status | Meaning | Sales claim? | Hue |
|--------|---------|:------------:|-----|
| **LIVE** | Production-certified integration; real credentials; smoke PASS | Qualified | Emerald |
| **BETA** | Partner API wired; staging smoke required before LIVE | With caveat | Amber |
| **PLACEHOLDER** | Roadmap / demo / partner gate — no live traffic | No | Zinc + amber accent |
| **SKIPPED** | Smoke or drill not run — reason documented | No | Slate / secondary |
| **PASS** | Artifact or gate succeeded (`proof_passed`, `PASSED`) | Internal only | Emerald |
| **NO-GO** | Pilot or launch blocked — open P0 gaps | No | Rose / destructive |

**Rule:** Display **SKIPPED WITH REASON** in UI and logs — never abbreviate to PASS.

---

## Token definitions

### LIVE

Production-certified channel or capability. Connection may still show amber if capability is BETA but connection verified — prefer maturity tier over connection green alone.

| Property | Light | Dark |
|----------|-------|------|
| Border | `border-emerald-500/30` | `border-emerald-500/40` |
| Background | `bg-emerald-500/10` | `bg-emerald-500/10` |
| Text | `text-emerald-950` | `text-emerald-50` |
| shadcn Badge | `variant="default"` (primary orange) **or** outline + emerald classes |

**Tailwind one-liner (preferred badge):**

```
border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-50
```

**Code references:**
- `components/integrations/integration-maturity-table.tsx` — `tierBadgeClass("LIVE")`
- `lib/status/status-colors.ts` — `success` tone
- `components/dashboard/integration-health-channel-cards-panel.tsx` — `healthy` card border

**Typography:** `text-xs font-semibold uppercase tracking-wide` (optional LIVE pill)

---

### BETA

Registry integration with honest BETA label — not certified LIVE. Always pair with tooltip: staging smoke required.

| Property | Light | Dark |
|----------|-------|------|
| Border | `border-amber-500/40` | `border-amber-500/40` |
| Background | `bg-amber-500/10` | `bg-amber-500/10` |
| Text | `text-amber-950` | `text-amber-100` |

**Component:** `components/integrations/beta-badge.tsx`

```
rounded-full border border-amber-500/40 bg-amber-500/10 text-[10px] font-semibold uppercase tracking-wide text-amber-950 dark:text-amber-100
```

**Also used for:** `SETUP_READY`, configured-but-unverified integrations in maturity table (amber family).

---

### PLACEHOLDER

Roadmap, partner-gated, or demo-only provider. Never show green OK (`showGreenOk: false` in `describeIntegrationConnectionHealth`).

| Property | Light | Dark |
|----------|-------|------|
| Border | `border-amber-500/50` or `border-zinc-400/40` | `border-amber-700/50` |
| Background | `bg-muted/10` or `bg-zinc-100/50` | `bg-zinc-900/40` |
| Text | `text-amber-800` | `text-amber-200` |
| Maturity table (roadmap) | `border-zinc-600 bg-zinc-800 text-zinc-200` | (platform dark table) |

**Component:** `components/channels/channel-card.tsx` — placeholder honesty badge

```
rounded-full border-amber-500/50 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200
```

**Truth labels:** `PLACEHOLDER` in `lib/integrations/integration-connection-health.ts` when `capabilityStatus` is `ROADMAP`, `NOT_AVAILABLE`, or `PARTNER_ACCESS_REQUIRED`.

---

### SKIPPED

Smoke, drill step, or CI job not executed — **not a failure, not a pass**. Use secondary/muted styling.

| Property | Light | Dark |
|----------|-------|------|
| Border | `border-border/70` | `border-border` |
| Background | `bg-muted/40` | `bg-muted/30` |
| Text | `text-muted-foreground` | `text-muted-foreground` |
| shadcn Badge | `variant="secondary"` | |

**Display label:** `SKIPPED WITH REASON` (full string in Integration Health UI)

**Code references:**
- `components/dashboard/integration-health-smoke-artifact-viewer.tsx` — `statusBadgeVariant("SKIPPED WITH REASON")`
- `lib/ci/staging-workflows-first-run-era15-policy.ts`
- `lib/commercial/pilot-rollback-drill-summary.ts` — step status `SKIPPED`

**Banner (next action pending):**

```
border-amber-200/80 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/20
```

---

### PASS

Artifact or gate succeeded. Internal/engineering surfaces only — do not use on public marketing without pilot proof.

| Property | Light | Dark |
|----------|-------|------|
| Border | `border-emerald-500/30` | `border-emerald-900/40` |
| Background | `bg-emerald-50/15` or `bg-emerald-500/10` | `bg-emerald-950/20` |
| Text | `text-emerald-800` | `text-emerald-100` |
| shadcn Badge | `variant="default"` or outline + emerald |

**Card highlight (tier2 / launch wizard):**

```
border-emerald-200/60 bg-emerald-50/10
```

**Code references:**
- Smoke artifacts: `PASSED` → `variant="default"`
- `lib/commercial/series-a-partner-expansion-phases-era21.ts` — `proof_passed`, `overall: PASSED`
- `components/dashboard/go-live/status-badges.tsx` — `success` → `bg-emerald-100 text-emerald-700`

**Typography:** `text-xs font-medium tabular-nums` for artifact timestamps beside PASS badge.

---

### NO-GO

Pilot, launch, or scale gate blocked. Distinct from FAILED (test ran and failed).

| Property | Light | Dark |
|----------|-------|------|
| Border | `border-destructive/40` or `border-rose-200/70` | `border-rose-900/40` |
| Background | `bg-destructive/10` or `bg-rose-50/15` | `bg-rose-950/20` |
| Text | `text-destructive` or `text-rose-800` | `text-rose-100` |
| shadcn Badge | `variant="destructive"` | |

**Code references:**
- Launch wizard commercial panels — NO-GO blockers
- `lib/launch-wizard/launch-wizard-era25-scale-readiness-convergence-era50.ts` — `goDecision: "NO-GO"`
- Smoke **FAILED** uses same destructive family (different label)

**Do not** use orange/amber for NO-GO — amber means “caution / incomplete”, not “blocked”.

---

## Shared tone system

`lib/status/status-colors.ts` maps operational tones used by orders, incidents, and generic badges:

| Tone | Classes | Maps to |
|------|---------|---------|
| `neutral` | `border-border/70 bg-muted/40 text-foreground` | SKIPPED, pending |
| `info` | `border-sky-500/30 bg-sky-500/10 text-sky-950 dark:text-sky-50` | In progress, info |
| `success` | `border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-50` | LIVE, PASS |
| `warning` | `border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-50` | BETA, PLACEHOLDER caution |
| `danger` | `border-destructive/40 bg-destructive/10 text-destructive` | NO-GO, FAILED, ERROR |

`components/status/operational-state-badge.tsx` uses the same palette for severity: `none`, `info`, `warning`, `blocker`.

---

## CSS variables (globals)

From `app/globals.css` — semantic colors underlying Tailwind tokens:

| Variable | Hex | Status use |
|----------|-----|------------|
| `--color-success` | `#22c55e` | PASS, LIVE (emerald family) |
| `--color-warning` | `#f59e0b` | BETA, PLACEHOLDER caution |
| `--color-error` | `#ef4444` | NO-GO, FAILED |
| `--color-info` | `#3b82f6` | In progress, drill running |
| `--color-text-muted` | `#8b8d96` | SKIPPED copy, meta |

Primary brand orange (`--color-accent` / `#ff5f1f`) is **not** a status green — reserve for CTAs, not LIVE claims.

---

## Component → token map

| Component | Path | Tokens used |
|-----------|------|-------------|
| `BetaBadge` | `components/integrations/beta-badge.tsx` | BETA |
| `OperationalStateBadge` | `components/status/operational-state-badge.tsx` | warning / danger / info |
| `StatusBadge` | `components/status/status-badge.tsx` | `STATUS_TONE_CLASSES` |
| `IntegrationMaturityTable` | `components/integrations/integration-maturity-table.tsx` | LIVE, BETA, PLACEHOLDER tiers |
| `ChannelCard` | `components/channels/channel-card.tsx` | LIVE + BETA + PLACEHOLDER |
| `KitchenCameraPreviewBanner` | `components/kitchen/kitchen-camera-preview-banner.tsx` | Preview honesty (amber warning) |
| `IntegrationHealthSmokeArtifactViewer` | `components/dashboard/integration-health-smoke-artifact-viewer.tsx` | PASS, SKIPPED, FAILED |
| `LaunchStatusBadge` | `components/dashboard/go-live/status-badges.tsx` | PASS/NO-GO via success/danger |

---

## Usage rules

### Integration cards

```
LIVE certified     → emerald badge + optional BetaBadge absent
BETA provider      → BetaBadge (amber) even if CONNECTED
PLACEHOLDER        → amber/zinc honesty badge; no health score green
```

### Smoke / CI artifacts

| Artifact status | Badge | Allowed sales language |
|-----------------|-------|------------------------|
| PASSED | Emerald / default | “Staging smoke passed on [date]” |
| SKIPPED WITH REASON | Secondary / muted | “Not yet verified — [reason]” |
| FAILED | Destructive | “Blocked — fix before pilot” |
| (missing) | Outline | “No artifact — do not claim PASS” |

### GO/NO-GO reports

- **GO** → emerald headline + checklist PASS rows
- **NO-GO** → destructive headline; list blockers in amber **only** for individual warning items, not the overall decision

---

## Anti-patterns (forbidden)

| Wrong | Right |
|-------|-------|
| Green badge for PLACEHOLDER Uber Direct | Amber PLACEHOLDER + link to plan doc |
| SKIPPED shown as green check | Secondary badge + reason string |
| BETA labeled LIVE in sales deck | BETA badge + staging smoke caveat |
| Orange primary button color implying “live” | Emerald PASS/LIVE tokens only |
| Hand-edited `PASSED` in JSON artifacts | Recompute from smoke scripts |

Enforced in part by `tests/unit/forbidden-claims-enforcement.test.ts`.

---

## Future consolidation (optional)

Consider extending `lib/status/status-colors.ts`:

```ts
export const MATURITY_STATUS_CLASSES = {
  LIVE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-50",
  BETA: "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100",
  PLACEHOLDER: "border-zinc-400/40 bg-muted/20 text-muted-foreground",
  SKIPPED: "border-border/70 bg-muted/40 text-muted-foreground",
  PASS: "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-50",
  NO_GO: "border-destructive/40 bg-destructive/10 text-destructive",
} as const;
```

Until then, use component-local classes documented above — they are the production source of truth.

---

## Related docs

| Doc | Topic |
|-----|-------|
| `docs/component-library.md` | Badge components |
| `docs/typography-audit.md` | Badge text sizes (`text-[10px]`, `text-xs`) |
| `docs/live-integration-definition-of-done.md` | LIVE criteria |
| `docs/accessibility-audit.md` | Contrast on amber/emerald pairs |
| `docs/feature-maturity-matrix.md` | Full maturity vocabulary |
