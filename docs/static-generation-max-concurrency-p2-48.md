# staticGenerationMaxConcurrency review (P2-48)

**Policy:** `static-generation-max-concurrency-p2-48-v1`  
**Decision:** `retain-vercel-1-local-uncapped`

Gap P2-48 measured SSG surface area and reviewed whether `staticGenerationMaxConcurrency: 1` can be raised.

## Measurements (2026-06-15)

| Metric | Value |
|--------|------:|
| App `page.tsx` routes | 957 |
| Dashboard pages | 706 |
| Vercel heap (`NODE_OPTIONS`) | 14336 MB |
| Vercel `experimental.cpus` | 1 |

## Decision

| Environment | Concurrency | Rationale |
|-------------|-------------|-----------|
| **Vercel production build** | **1** | 957 SSG paths + `cpus: 1`; historical OOM at higher concurrency |
| **Local build** | Next.js default (uncapped) | Faster iteration; no remote builder memory ceiling |
| **Override** | `NEXT_STATIC_GENERATION_MAX_CONCURRENCY` | Analyze/OOM recovery experiments |

**Verdict:** Do **not** increase Vercel default above 1 without larger builders or fewer SSG paths.

## Wiring

- `lib/performance/static-generation-concurrency-policy.ts` — resolver
- `next.config.ts` — conditional `experimental.staticGenerationMaxConcurrency`
- `scripts/vercel-build.sh` — exports `NEXT_STATIC_GENERATION_MAX_CONCURRENCY=1`

## CI

```bash
npm run check:static-generation-max-concurrency-p2-48
```

## Artifact

`artifacts/static-generation-max-concurrency-p2-48.json`
