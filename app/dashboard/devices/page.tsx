import { DeviceStatusDashboard } from "@/components/dashboard/devices/device-status-dashboard";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { hasIntegrationHealthPageAccess } from "@/lib/ux/permission-denied-page-access-era19";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { loadDeviceStatusDashboardModel } from "@/services/integration-health/device-status-dashboard-service";

export default async function DeviceStatusDashboardPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasIntegrationHealthPageAccess(actor)) {
    return <PermissionDeniedSurfaceCard surfaceId="integration_health" />;
  }

  const model = await loadDeviceStatusDashboardModel(actor.dataUserId);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Operations
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Device status dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Clover parity view for registers, POS terminals, and Stripe readers — grouped by location
          with online/offline badges and attention alerts. Honest posture: not proprietary hub
          telemetry; reader status syncs from Stripe when configured.
        </p>
      </div>

      <DeviceStatusDashboard model={model} />
    </div>
  );
}
