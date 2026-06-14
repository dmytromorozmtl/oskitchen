/**
 * Static generation concurrency — Task 14 / next.config experimental.
 *
 * Investigation (Jun 2026):
 * - 655+ app routes; Vercel remote builds OOM without throttling SSG + webpack.
 * - Paired with `experimental.cpus: 1` and `NODE_OPTIONS=--max-old-space-size=14336` in vercel-build.sh.
 * - `NEXT_STATIC_GENERATION_MAX_CONCURRENCY=1` remains the production default; do not remove on Vercel.
 * - Local builds omit the cap (Next.js default) unless env is set — e.g. analyze OOM recovery.
 *
 * @see docs/static-generation-max-concurrency-p2-48.md — P2-48 measurement review (957 app pages; retain Vercel=1)
 */

export const STATIC_GENERATION_MAX_CONCURRENCY_VERCEL_DEFAULT = 1 as const;

export function resolveStaticGenerationMaxConcurrency(): number | undefined {
  const raw = process.env.NEXT_STATIC_GENERATION_MAX_CONCURRENCY?.trim();
  if (raw) {
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }

  if (process.env.VERCEL) {
    return STATIC_GENERATION_MAX_CONCURRENCY_VERCEL_DEFAULT;
  }

  return undefined;
}

export function staticGenerationConcurrencyInvestigationSummary(): string {
  return [
    "Vercel: keep concurrency=1 (OOM guard for 655+ SSG paths).",
    "Local: no cap unless NEXT_STATIC_GENERATION_MAX_CONCURRENCY is set.",
    "Override: NEXT_STATIC_GENERATION_MAX_CONCURRENCY for analyze/OOM recovery.",
  ].join(" ");
}
