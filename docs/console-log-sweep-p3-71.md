# Console.log sweep (P3-71)

**Policy:** `console-log-sweep-p3-71-v1`  
**Department:** Backend  
**Upstream:** `console-log-sweep-p1-38-v1`  
**Registry:** [`artifacts/console-log-sweep-p3-71-registry.json`](../artifacts/console-log-sweep-p3-71-registry.json)

---

## Production runtime paths (Tier A)

Zero `console.log` / `console.debug` / `console.info` in:

| Zone | Directories |
|------|-------------|
| Runtime | `app/`, `components/`, `actions/`, `services/` |
| Library | `lib/` (allowlist: `lib/logger.ts`, smoke formatters only) |

Use **`lib/logger.ts`** for structured, redacted logging.

Full policy: [`docs/console-log-audit.md`](./console-log-audit.md)

---

## Verify

```bash
npm run check:console-log-sweep-p3-71
npm run audit:console-log-sweep-p3-71
npm run audit:console-log-surface -- --write
npm run test:ci:console-log-sweep:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` (console-log-surface + P3-71 cert)

---

## Status

Production runtime paths: **0 console.log hits** (June 2026). ESLint `no-console` enforced on runtime dirs.
