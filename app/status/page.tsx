import { PublicShell } from "@/components/marketing/public-page";
import { StatusObservabilityPanel } from "@/components/status/status-observability-panel";
import { SITE_URL } from "@/lib/constants";

export const metadata = { title: "System status" };
export const revalidate = 60;

type HealthCheck = { ok: boolean; latencyMs?: number };
type HealthPayload = {
  status: string;
  timestamp?: string;
  checks: Record<string, HealthCheck | { ok: boolean }>;
};

async function loadHealth(): Promise<HealthPayload> {
  try {
    const res = await fetch(`${SITE_URL}/api/health`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("health_unavailable");
    return (await res.json()) as HealthPayload;
  } catch {
    return {
      status: "degraded",
      checks: {
        app: { ok: false },
        database: { ok: false },
      },
    };
  }
}

export default async function StatusPage() {
  const health = await loadHealth();
  const entries = Object.entries(health.checks ?? {});

  return (
    <PublicShell>
      <main className="mx-auto max-w-2xl space-y-8 px-4 py-16 sm:px-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">KitchenOS status</h1>
          <p className="mt-2 text-muted-foreground">
            Live checks from the production health endpoint. Overall:{" "}
            <span className="font-medium capitalize">{health.status}</span>
          </p>
        </div>
        <div className="space-y-3">
          {entries.map(([name, check]) => {
            const ok = Boolean(check && typeof check === "object" && "ok" in check && check.ok);
            return (
              <div
                key={name}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <span className="font-medium capitalize">{name.replace(/([A-Z])/g, " $1")}</span>
                <span
                  className={`inline-flex items-center gap-2 text-sm ${ok ? "text-emerald-700" : "text-rose-700"}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-rose-500"}`}
                    aria-hidden
                  />
                  {ok ? "Operational" : "Degraded"}
                </span>
              </div>
            );
          })}
        </div>
        {health.timestamp ? (
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(health.timestamp).toLocaleString()}
          </p>
        ) : null}
        <StatusObservabilityPanel />
      </main>
    </PublicShell>
  );
}
