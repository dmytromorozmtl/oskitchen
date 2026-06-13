import type { Metadata } from "next";

import { IntegrationStatusFleetPanel } from "@/components/marketing/integration-status-fleet-panel";
import { PublicShell } from "@/components/marketing/public-page";
import { StatusObservabilityPanel } from "@/components/status/status-observability-panel";
import { SITE_URL } from "@/lib/constants";
import {
  INTEGRATION_STATUS_PAGE_META,
  INTEGRATION_STATUS_PAGE_PATH,
  INTEGRATION_STATUS_PAGE_TEST_ID,
} from "@/lib/marketing/integration-status-page-content";
import { loadPublicIntegrationFleetSnapshot } from "@/lib/marketing/integration-status-page-data";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: INTEGRATION_STATUS_PAGE_META.title,
  description: INTEGRATION_STATUS_PAGE_META.description,
  path: INTEGRATION_STATUS_PAGE_PATH,
  keywords: [...INTEGRATION_STATUS_PAGE_META.keywords],
});

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
  const fleetSnapshot = loadPublicIntegrationFleetSnapshot();
  const entries = Object.entries(health.checks ?? {});

  return (
    <PublicShell>
      <main
        className="mx-auto max-w-4xl space-y-12 px-4 py-16 sm:px-6"
        data-testid={INTEGRATION_STATUS_PAGE_TEST_ID}
      >
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">OS Kitchen status</h1>
          <p className="mt-2 text-muted-foreground">
            Platform health checks and honest integration fleet status — no fabricated uptime
            percentages.
          </p>
        </div>

        <section aria-labelledby="platform-health-heading">
          <h2 id="platform-health-heading" className="text-xl font-semibold">
            Platform health
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Live checks from the production health endpoint. Overall:{" "}
            <span className="font-medium capitalize">{health.status}</span>
          </p>
          <div className="mt-4 space-y-3">
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
            <p className="mt-3 text-xs text-muted-foreground">
              Last updated: {new Date(health.timestamp).toLocaleString()}
            </p>
          ) : null}
        </section>

        <IntegrationStatusFleetPanel snapshot={fleetSnapshot} />

        <StatusObservabilityPanel />
      </main>
    </PublicShell>
  );
}
