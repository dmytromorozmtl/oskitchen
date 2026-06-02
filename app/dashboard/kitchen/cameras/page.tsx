import { AiFeatureApiError } from "@/components/dashboard/ai-feature-api-error";
import { KitchenCamerasDashboard } from "@/components/dashboard/kitchen-cameras-dashboard";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveKitchenCameraSyntheticMode } from "@/lib/ai/kitchen-camera-synthetic-mode";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadAiFeaturePage } from "@/lib/ai/load-ai-feature-page";
import { loadKitchenCameraDashboard } from "@/services/ai/kitchen-camera-dashboard";

export const dynamic = "force-dynamic";

export default async function KitchenCamerasPage() {
  const actor = await requireWorkspacePermissionActor();
  const { workspaceId } = await getTenantActor();

  if (!hasPermission(actor.granted, "kitchen.view")) {
    return <PermissionDeniedSurfaceCard surfaceId="kds" />;
  }

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Kitchen Cameras requires a workspace</CardTitle>
          <CardDescription>Complete workspace setup to view camera analytics.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const payload = await loadAiFeaturePage(() => loadKitchenCameraDashboard(workspaceId));
  if (!payload.ok) {
    return <AiFeatureApiError featureName="Kitchen Camera AI" error={payload.error} />;
  }

  const { showPreviewBanner } = resolveKitchenCameraSyntheticMode({
    dataSource: payload.data.dataSource,
    hasLiveStream: payload.data.cameras.some((camera) => Boolean(camera.config.streamUrl?.trim())),
  });

  return (
    <div className="p-4 md:p-6">
      <KitchenCamerasDashboard {...payload.data} showPreviewBanner={showPreviewBanner} />
    </div>
  );
}
