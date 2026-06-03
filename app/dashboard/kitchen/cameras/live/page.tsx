import Link from "next/link";

import { CameraLivePanel } from "@/components/kitchen/camera-live-panel";
import { KitchenCameraPreviewBanner } from "@/components/kitchen/kitchen-camera-preview-banner";
import { Button } from "@/components/ui/button";
import { loadAiFeaturePage } from "@/lib/ai/load-ai-feature-page";
import { resolveKitchenCameraSyntheticMode } from "@/lib/ai/kitchen-camera-synthetic-mode";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getCameraLiveDashboard } from "@/services/ai/camera-live-service";

export const metadata = {
  title: "AI Camera LIVE — Kitchen",
  description: "Real-time computer vision for queues, PPE compliance, and station downtime.",
};

export default async function KitchenCamerasLivePage() {
  const { workspaceId } = await getTenantActor();
  if (!workspaceId) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Open a workspace to use AI Camera LIVE.
      </div>
    );
  }

  const payload = await loadAiFeaturePage(() => getCameraLiveDashboard(workspaceId));
  if (!payload.ok) {
    return (
      <div className="py-10 text-center text-sm text-destructive">
        Could not load LIVE camera analysis.
      </div>
    );
  }

  const { showPreviewBanner } = resolveKitchenCameraSyntheticMode({
    dataSource: payload.data.dataSource,
    hasLiveStream: payload.data.cameras.some((c) => Boolean(c.config.streamUrl?.trim())),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      {showPreviewBanner ? <KitchenCameraPreviewBanner /> : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Camera LIVE</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Real-time CV for ticket queues, PPE compliance, equipment stress, and idle downtime —
            updated every {payload.data.refreshSeconds} seconds.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/kitchen/cameras">← Camera overview</Link>
        </Button>
      </div>

      <CameraLivePanel dashboard={payload.data} />
    </div>
  );
}
