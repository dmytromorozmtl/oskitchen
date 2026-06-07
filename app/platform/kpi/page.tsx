import { KpiDashboardPanel } from "@/components/platform/kpi-dashboard-panel";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { getKpiDashboardSnapshot } from "@/services/platform/kpi-dashboard-service";

export default async function PlatformKpiPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:access");
  const snapshot = await getKpiDashboardSnapshot();

  return (
    <div className="space-y-8 text-zinc-100">
      <div>
        <h1 className="text-2xl font-semibold text-white">KPI dashboard</h1>
        <p className="mt-1 max-w-3xl text-sm text-zinc-400">
          Six core operating metrics for OS Kitchen platform operators: MRR, NPS, time-to-first-order
          (TTF), uptime, error rate, and DAU. Values are sourced from Postgres and observability
          rollups — never guessed when Stripe or survey data is missing.
        </p>
      </div>

      <KpiDashboardPanel snapshot={snapshot} />
    </div>
  );
}
