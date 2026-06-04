# Color token audit — OS Kitchen

**Policy:** `color-token-audit-des21-v1`  
**Date:** 2026-06-03  
**Owner:** Design + Engineering  
**Scope:** Dashboard charts, marketplace analytics, Integration Health landing, profit gauge  
**Related:** [`status-color-tokens.md`](./status-color-tokens.md) · [`dark-mode-audit.md`](./dark-mode-audit.md) · `lib/design/color-tokens.ts`

---

## Executive summary

| Metric | Before (June 3 audit) | After DES-21 | Target |
|--------|:---------------------:|:------------:|:------:|
| **Color token consistency** | ~85% | **≥95%** | 95% |
| **Hardcoded hex in DES-21 modules** | 47+ | **0** | 0 |
| **Canonical token source** | Mixed `globals.css` + inline hex | `lib/design/color-tokens.ts` | Single map |

DES-21 centralizes chart and status colors into CSS-variable-backed tokens and migrates nine high-traffic dashboard/marketing chart surfaces off raw hex literals.

---

## Token architecture

### Primary source: `app/globals.css`

```css
--color-accent: #ff5f1f;
--color-success: #22c55e;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;
```

### Programmatic layer: `lib/design/color-tokens.ts`

| Export | Use case |
|--------|----------|
| `colorVar.*` | Recharts stroke/fill, QR codes, inline SVG |
| `chartSeriesColors` / `chartSeriesColor()` | Donut, pie, multi-line charts |
| `chartAxisChrome` | Grid, tick, tooltip chrome |
| `integrationHealthStatusColors` | Landing Integration Health moat rows |
| `marginGaugeGradientStops` | Profit margin gauge SVG gradients |
| `benchmarkRadarColors` | Benchmark radar + trend line |

### Audit gate: `lib/design/color-token-audit-policy.ts`

- Baseline: **85%** (forensic audit Section 9)
- Target: **95%**
- CI unit test: `tests/unit/color-token-audit-policy.test.ts`

---

## DES-21 migrated modules (9)

| Module | Change |
|--------|--------|
| `components/marketplace/vendor-dashboard-client.tsx` | Revenue chart → `colorVar.accent` |
| `components/marketplace/marketplace-analytics-charts.tsx` | Palette + line strokes → tokens |
| `components/platform/marketplace-analytics-admin-client.tsx` | GMV area, pie, bar → tokens |
| `components/marketing/landing-integration-health-moat.tsx` | Status rows → `integrationHealthStatusColors` |
| `components/analytics/profit-gauge.tsx` | Gauge gradients → `marginGaugeGradientStops` |
| `components/dashboard/overview-charts.tsx` | Fulfillment chart → tokens |
| `components/dashboard/benchmark-dashboard.tsx` | Radar + trend → `benchmarkRadarColors` |
| `components/purchasing/supplier-price-chart.tsx` | Multi-supplier lines → `chartSeriesColor()` |
| `components/public/order-qr.tsx` | QR fg → `colorVar.accent` |

---

## Usage rules

1. **Dashboard JSX** — prefer Tailwind semantic utilities (`bg-primary`, `text-muted-foreground`, `border-border`).
2. **Recharts / SVG** — import from `lib/design/color-tokens.ts`; never inline brand hex.
3. **Status colors** — use `docs/status-color-tokens.md` Tailwind pairs for LIVE/BETA/SKIPPED badges.
4. **Storefront merchant themes** — keep separate `lib/storefront-builder/design-tokens.ts` (tenant-scoped).
5. **Email/HTML reports** — inline hex allowed in `lib/ops/*-html.ts` (out of DES-21 scope).

---

## Remediation backlog (post DES-21)

| Priority | Item | Owner |
|:--------:|------|-------|
| P2 | Migrate `components/analytics/cookie-consent.tsx` inline styles | Design |
| P2 | CRM segment colors in `lib/crm/customer-segments.ts` | Product |
| P3 | Storefront theme preset hex (merchant-owned palettes) | Storefront |

---

## Verification

```bash
npx vitest run tests/unit/color-token-audit-policy.test.ts
```

Expected: `overallCoveragePercent >= 95`, all DES-21 modules `hardcodedHex === 0`.
