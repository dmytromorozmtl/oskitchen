import { SITE_URL } from "@/lib/constants";

type HealthPayload = {
  status: string;
  version?: string;
  timestamp?: string;
  checks?: Record<
    string,
    { ok: boolean; latencyMs?: number } | { ok: boolean; backend?: string }
  >;
};

/** Placeholder CWV — populated from PostHog when NEXT_PUBLIC_POSTHOG_KEY is set in production. */
const CWV_PLACEHOLDER = [
  { name: "LCP", value: "—", rating: "needs-data" as const, threshold: "≤ 2.5s" },
  { name: "INP", value: "—", rating: "needs-data" as const, threshold: "≤ 200ms" },
  { name: "CLS", value: "—", rating: "needs-data" as const, threshold: "≤ 0.1" },
];

function ratingClass(rating: string) {
  if (rating === "good") return "text-emerald-700";
  if (rating === "poor") return "text-rose-700";
  return "text-muted-foreground";
}

export async function StatusObservabilityPanel() {
  let health: HealthPayload = { status: "unknown" };
  try {
    const res = await fetch(`${SITE_URL}/api/health`, { next: { revalidate: 60 } });
    if (res.ok) health = (await res.json()) as HealthPayload;
  } catch {
    /* degraded display */
  }

  const db = health.checks?.database as { ok?: boolean; latencyMs?: number } | undefined;
  const obs = health.checks?.observability as { backend?: string } | undefined;
  const sentry = health.checks?.sentryServer as { ok?: boolean } | undefined;

  return (
    <section className="space-y-6 rounded-xl border p-6">
      <h2 className="text-lg font-semibold">Observability</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Database latency (last check)</p>
          <p className="mt-1 text-2xl font-semibold">
            {db?.latencyMs != null ? `${db.latencyMs} ms` : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Target p95 &lt; 500 ms (Sentry alert)</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">APM backend</p>
          <p className="mt-1 text-2xl font-semibold">{obs?.backend ?? "SENTRY"}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sentry connected: {sentry?.ok ? "yes" : "configure SENTRY_DSN"}
          </p>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium">Core Web Vitals (7d, PostHog)</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          {CWV_PLACEHOLDER.map((m) => (
            <li key={m.name} className="rounded-lg border px-3 py-2 text-sm">
              <span className="font-medium">{m.name}</span>
              <span className={`ml-2 ${ratingClass(m.rating)}`}>{m.value}</span>
              <p className="text-xs text-muted-foreground">{m.threshold}</p>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-muted-foreground">
        Deploy: {health.version ?? "dev"} · Uptime rollup: connect PostHog + Sentry for 30-day SLA view
      </p>
    </section>
  );
}
