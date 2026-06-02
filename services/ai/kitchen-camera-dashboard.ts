import {
  attachCameraConfig,
  buildActivityHeatmap,
  buildCameraAlerts,
  buildSyntheticTimeline30m,
  framesToTimelinePoints,
  mergeTimelineHistory,
} from "@/lib/ai/kitchen-camera-dashboard-builders";
import type { KitchenCameraDashboardPayload } from "@/lib/ai/kitchen-camera-dashboard-types";
import {
  loadKitchenCameraHistory,
  saveKitchenCameraHistory,
} from "@/lib/ai/kitchen-camera-storage";
import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { analyzeKitchenCameras, getKitchenCameras } from "@/services/ai/kitchen-camera";

export type { KitchenCameraDashboardPayload } from "@/lib/ai/kitchen-camera-dashboard-types";

/** Server bundle for Kitchen Camera dashboard UI. */
export async function loadKitchenCameraDashboard(
  workspaceId: string,
): Promise<KitchenCameraDashboardPayload> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) throw new Error(`Workspace not found: ${workspaceId}`);

  const [analysis, configs, history] = await Promise.all([
    analyzeKitchenCameras(workspaceId),
    getKitchenCameras(workspaceId),
    loadKitchenCameraHistory(ownerUserId),
  ]);

  const now = new Date();
  const freshPoints = framesToTimelinePoints(analysis.cameras, now);
  const mergedTimeline = mergeTimelineHistory(history.timeline, freshPoints, now);
  await saveKitchenCameraHistory(ownerUserId, { timeline: mergedTimeline });

  const timeline30m =
    mergedTimeline.length >= 6
      ? mergedTimeline
      : buildSyntheticTimeline30m(analysis.cameras, now);

  const alerts = buildCameraAlerts(analysis.cameras, now);
  const activityHeatmap = buildActivityHeatmap(timeline30m, now);
  const cameras = attachCameraConfig(analysis.cameras, configs);

  return {
    ...analysis,
    cameras,
    alerts,
    timeline30m,
    activityHeatmap,
  };
}
