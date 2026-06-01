# Console.log Sweep Plan

**Status:** Draft — baseline captured; production runtime paths already clean  
**Policy:** `console-log-sweep-v1`  
**Audience:** Engineering, DevOps, Release  
**Baseline (2026-06-01):** **3,181** `console.log` occurrences in tracked `*.{ts,tsx,js,jsx}`  
**Related:** [`lib/logger.ts`](../lib/logger.ts) · [`fullreport1june.md`](./fullreport1june.md) · [`npm-script-trim-rfc.md`](./npm-script-trim-rfc.md) (future ops script consolidation)

---

## Purpose

Reduce log noise, prevent credential leakage in production, and make Vercel/log-drain signal usable. The headline count (**3,181 &gt; 3,000**) is **HIGH debt** per the June audit — but most calls live in **CLI scripts**, not customer-facing runtime.

**Honesty rule:** Do not claim “log hygiene complete” until `artifacts/console-log-sweep-summary.json` shows **0** `console.log` in Tier A (production runtime) and CI gate PASS.

---

## Baseline breakdown (June 2026)

| Tier | Path glob | Approx. count | Risk | Sweep action |
|------|-----------|---------------|------|--------------|
| **A — Production runtime** | `app/`, `actions/`, `components/`, `services/`, `middleware.ts`, `lib/**` (excl. test helpers) | **~6** | **HIGH** — ships to Vercel | Replace with `logger.*`; **block in CI** |
| **B — API / cron handlers** | `app/api/**`, `services/cron/**` | **0** (verified) | HIGH | Maintain zero |
| **C — CLI / ops scripts** | `scripts/**` (incl. `scripts/ops/*era25*`) | **~3,170+** | LOW for prod; HIGH for maintainer noise | Allow with eslint override; consolidate via npm trim RFC |
| **D — Tests / e2e** | `tests/**`, `e2e/**` | **~1** | LOW | Remove or gate behind `DEBUG` |

**Finding:** Pilot blockers are **not** blocked by console.log volume — Tier A is nearly clean. Priority is **guardrails + artifact**, not a 3-week manual delete of ops orchestrator scripts.

---

## Targets

| Metric | Current | Phase 1 (pilot) | Phase 2 (post-pilot) |
|--------|---------|-----------------|----------------------|
| Tier A `console.log` | ~6 | **0** | **0** (enforced) |
| Tier B `console.log` | 0 | **0** | **0** |
| Total repo count | 3,181 | **&lt; 3,100** (Tier A zeroed) | **&lt; 800** (ops script trim) |
| ESLint `no-console` on Tier A | none | **error** | **error** |
| CI regression gate | none | **warn → error** | **error** |

---

## Standard: use `lib/logger.ts`

Production code MUST use the shared logger (redaction-aware):

```typescript
import { logger } from "@/lib/logger";

logger.debug("order.ingest", { orderId }); // dev-only
logger.warn("webhook.retry", { attempt });  // always
logger.error("stripe.capture.failed", { err });
```

| Method | When | Ships to prod stdout? |
|--------|------|------------------------|
| `logger.debug` | Verbose diagnostics | **No** (`NODE_ENV !== production`) |
| `logger.info` | Lifecycle milestones | Dev only |
| `logger.warn` | Recoverable anomalies | **Yes** |
| `logger.error` | Failures | **Yes** |

**Never** log raw tokens, webhook secrets, or full PII — `redactForLog()` already strips common patterns.

---

## Phase 1 — Guard Tier A (1–2 days)

### Step 1.1 — Baseline artifact script

Add `scripts/audit-console-log-surface.ts`:

- Walk repo (exclude `node_modules`, `.next`)
- Emit `artifacts/console-log-sweep-summary.json`:

```json
{
  "generatedAt": "ISO",
  "total": 3181,
  "byTier": { "A": 6, "B": 0, "C": 3174, "D": 1 },
  "tierAFiles": ["lib/integrations/channel-live-smoke-summary.ts"],
  "pass": false
}
```

- `pass: true` when `byTier.A === 0 && byTier.B === 0`

Wire npm script: `audit:console-log-surface`.

### Step 1.2 — Fix Tier A stragglers

| File | Action |
|------|--------|
| `lib/integrations/channel-live-smoke-summary.ts` | Replace 6× `console.log` → `logger.debug` or structured summary return only |

Re-run artifact; commit when `tierAFiles: []`.

### Step 1.3 — ESLint scope

Extend `eslint.config.mjs`:

```javascript
{
  files: ["app/**/*", "actions/**/*", "components/**/*", "services/**/*", "lib/**/*"],
  ignores: ["**/*.test.ts", "**/*.spec.ts"],
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
  },
},
{
  files: ["scripts/**/*"],
  rules: { "no-console": "off" }, // CLI stdout is intentional
}
```

### Step 1.4 — CI gate (soft then hard)

1. **Week 1:** `npm run audit:console-log-surface` in CI → **warn** if Tier A &gt; 0  
2. **Week 2:** upgrade to **fail** on Tier A regression  
3. Optional: fail if `total` increases &gt; 5% vs baseline artifact (prevents ops script sprawl)

---

## Phase 2 — Ops script noise (post-pilot, 1–2 weeks)

Most of the 3,181 count is **`scripts/ops/*`** era25 orchestrators (validate/sync pairs with 3–14 logs each). Do **not** hand-edit 200+ files before pilot.

| Approach | Owner | Outcome |
|----------|-------|---------|
| **npm script trim RFC** | Platform | Delete or merge duplicate era25 validate/sync scripts |
| Shared CLI helper | Platform | `scripts/_cli/log.ts` — `log.info()`, `log.pass()` for scripts only |
| Archive dead orchestrators | Ops | Move superseded chains to `scripts/ops/_archive/` (excluded from grep baseline) |

**Target after trim:** total &lt; 800 without touching production runtime.

---

## Phase 3 — Observability alignment (Q3 2026)

| Item | Notes |
|------|-------|
| Vercel log drain | Structured JSON via `logger.warn/error` only in prod |
| Request correlation | Add `requestId` to logger context in middleware (separate RFC) |
| PII audit | Cross-check with webhook signature matrix script |
| `console.debug/info` in client components | Ban via `no-console` on `**/*client*.tsx` |

---

## Out of scope (this plan)

- Deleting all CLI `console.log` in `scripts/ops/**` (covered by npm trim RFC)
- Replacing `console.warn` / `console.error` in logger implementation itself
- Third-party dependency log suppression
- Browser DevTools filtering documentation

---

## Verification checklist

| # | Check | Command / artifact |
|---|-------|-------------------|
| 1 | Baseline artifact exists | `artifacts/console-log-sweep-summary.json` |
| 2 | Tier A = 0 | `jq '.byTier.A' artifacts/console-log-sweep-summary.json` → `0` |
| 3 | ESLint clean on app/lib | `npx eslint app lib services actions components --max-warnings 0` |
| 4 | No new Tier A in PR diff | CI compares artifact tier A file list |
| 5 | Production smoke | `npm run smoke:production-tenant` — no raw credential substrings in stdout |

**Pass artifact:**

```json
{
  "pass": true,
  "tierA": 0,
  "tierB": 0,
  "total": 3090,
  "verifiedAt": "2026-06-XX"
}
```

---

## Ownership & timeline

| Phase | Window | DRI | Exit |
|-------|--------|-----|------|
| 1 — Tier A guard | Pilot Week −1 | Platform | ESLint + artifact PASS |
| 2 — Ops trim | Post-pilot Month 1 | Platform + Ops | total &lt; 800 |
| 3 — Structured prod logs | Q3 2026 | DevOps | Log drain dashboards live |

---

## References

- Logger: [`lib/logger.ts`](../lib/logger.ts)
- Audit source: [`fullreport1june.md`](./fullreport1june.md) § Code Quality (3,181)
- Vault / staging (orthogonal): [`vault-one-pager.md`](./vault-one-pager.md)
- Future script consolidation: [`npm-script-trim-rfc.md`](./npm-script-trim-rfc.md) (action 28)
