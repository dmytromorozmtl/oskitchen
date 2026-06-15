import type { CameraDataSource } from "@/lib/ai/kitchen-camera-types";

/** When true, dashboard shows preview banner (default honest unless explicitly disabled). */
export function isKitchenCameraSyntheticModeEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const flag = env.KITCHEN_CAMERA_SYNTHETIC?.trim().toLowerCase();
  if (flag === "0" || flag === "false" || flag === "no") return false;
  if (flag === "1" || flag === "true" || flag === "yes") return true;
  return true;
}

export function resolveKitchenCameraSyntheticMode(input: {
  dataSource: CameraDataSource;
  hasLiveStream: boolean;
  env?: NodeJS.ProcessEnv;
}): { synthetic: boolean; showPreviewBanner: boolean } {
  const env = input.env ?? process.env;
  if (!isKitchenCameraSyntheticModeEnabled(env)) {
    return { synthetic: false, showPreviewBanner: false };
  }

  const inferredSynthetic =
    input.dataSource !== "live_frame" || !input.hasLiveStream;

  return {
    synthetic: inferredSynthetic,
    showPreviewBanner: inferredSynthetic,
  };
}
