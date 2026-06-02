# Console.log audit — OS Kitchen

**Version:** 1.0 · **June 2026**  
**Script:** `scripts/audit-console-log.sh`  
**Artifact:** `artifacts/console-log-audit.json` (with `--write`)

Production code should log through **`lib/logger.ts`** (structured, redacted). Raw `console.log` / `console.debug` / `console.info` in runtime paths leak noise to Vercel logs and bypass redaction.

---

## Policy

| Zone | Directories | Rule |
|------|-------------|------|
| **Runtime (strict)** | `app/`, `components/`, `actions/`, `services/` | **Zero** `console.log/debug/info` — use `logger.debug/info/warn/error` |
| **Library** | `lib/` | Avoid; allowlist only for wrappers and CLI formatters |
| **Tooling (allowed)** | `scripts/`, `tests/`, `prisma/` | CLI output OK |
| **Docs / artifacts** | Not scanned | Examples in markdown are OK |

### Allowlist (library)

| File | Reason |
|------|--------|
| `lib/logger.ts` | Intentional `console.*` wrapper with `redactForLog()` |
| `lib/integrations/channel-live-smoke-summary.ts` | Smoke CLI formatter (not web runtime) |

Add new allowlist entries only with a one-line justification in this doc.

---

## Run the audit

```bash
# Human-readable summary
./scripts/audit-console-log.sh

# Write JSON artifact
./scripts/audit-console-log.sh --write

# CI gate — fail if runtime dirs have any hits
./scripts/audit-console-log.sh --strict

# npm alias
npm run audit:console-log
npm run audit:console-log -- --write --strict
```

### Exit codes

| Code | Meaning |
|------|---------|
| `0` | Pass (or warn-only library hits without `--strict`) |
| `1` | `--strict` and runtime hits > 0 |

### Overall status

| Status | Condition |
|--------|-----------|
| **PASS** | Runtime hits = 0 |
| **WARN** | Runtime = 0, unallowlisted `lib/` hits > 0 |
| **FAIL** | Any runtime hit |

---

## Baseline (2026-06-02)

First audit after introducing the script:

| Bucket | Count | Notes |
|--------|------:|-------|
| Runtime (`app`, `components`, `actions`, `services`) | **0** | PASS |
| Library (`lib/`, excl. allowlist) | **0** | PASS |
| Scripts | 3,181 | Informational — ops/CLI scripts |
| Tests | 1 | Informational — `tests/e2e/a11y-marketing.spec.ts` debug dump |

**Overall: PASS** — runtime paths are clean. High script count is expected (orchestrators, smokes, beta tooling).

Regenerate baseline:

```bash
./scripts/audit-console-log.sh --write
cat artifacts/console-log-audit.json | python3 -m json.tool | head -20
```

---

## Sweep execution (Task 74 — 2026-06-02)

**Command:** `npm run audit:console-log -- --write`  
**Artifact:** `artifacts/console-log-audit.json` (`generatedAt: 2026-06-02T15:17:30Z`)  
**Strict gate:** `./scripts/audit-console-log.sh --strict` → exit **0**

| Bucket | Count | vs baseline |
|--------|------:|-------------|
| Runtime | 0 | unchanged |
| Library | 0 | unchanged |
| Scripts | 3,181 | unchanged |
| Tests | 1 | unchanged |

**Result:** **PASS** — no remediation required in Tier A/B. Ops script volume (3,181) remains deferred to [`console-log-sweep-plan.md`](./console-log-sweep-plan.md) Phase 2.

**Next:** wire `--strict` into CI (see CI integration below).

---

## Remediation guide

### Replace runtime logging

```typescript
// Before
console.log("order created", orderId);

// After
import { logger } from "@/lib/logger";
logger.info("order created", { orderId });
```

### When `console.log` is acceptable

- One-off `scripts/*.ts` CLI progress output
- Seed / migration helpers under `prisma/`
- Test debugging (prefer removing before merge)

### When to use Sentry instead

Uncaught errors and production incidents → `captureErrorSafe()` (`services/observability/error-reporting-service.ts`). See [`observability-setup.md`](./observability-setup.md).

---

## CI integration (future)

Task 74 sweep **executed** — artifact committed. Suggested CI check:

```yaml
- name: Console.log audit (runtime)
  run: npm run audit:console-log -- --strict
```

---

## Related

| Doc / module | Topic |
|--------------|-------|
| [`observability-setup.md`](./observability-setup.md) | Sentry, OTEL, logging policy |
| `lib/logger.ts` | Canonical logger |
| `lib/observability/redaction.ts` | Safe context redaction |
