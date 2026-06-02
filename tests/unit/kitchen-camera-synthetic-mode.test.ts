import { describe, expect, it } from "vitest";

import { resolveKitchenCameraSyntheticMode } from "@/lib/ai/kitchen-camera-synthetic-mode";

describe("kitchen-camera-synthetic-mode", () => {
  it("shows preview banner for synthetic KDS data without live stream", () => {
    const mode = resolveKitchenCameraSyntheticMode({
      dataSource: "synthetic_kds",
      hasLiveStream: false,
      env: { KITCHEN_CAMERA_SYNTHETIC: "1" },
    });
    expect(mode.showPreviewBanner).toBe(true);
  });

  it("hides banner when synthetic mode explicitly disabled", () => {
    const mode = resolveKitchenCameraSyntheticMode({
      dataSource: "synthetic_kds",
      hasLiveStream: false,
      env: { KITCHEN_CAMERA_SYNTHETIC: "0" },
    });
    expect(mode.showPreviewBanner).toBe(false);
  });

  it("hides banner when live frame feeds are connected", () => {
    const mode = resolveKitchenCameraSyntheticMode({
      dataSource: "live_frame",
      hasLiveStream: true,
      env: { KITCHEN_CAMERA_SYNTHETIC: "1" },
    });
    expect(mode.showPreviewBanner).toBe(false);
  });
});
