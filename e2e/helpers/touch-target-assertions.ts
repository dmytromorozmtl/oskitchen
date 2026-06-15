import { expect, type Locator } from "@playwright/test";

import { MOBILE_TOUCH_TARGET_FLOOR_PX } from "@/lib/accessibility/mobile-touch-target-44px-policy";

export async function expectLocatorMeetsTouchTargetFloor(
  locator: Locator,
  options?: { floorPx?: number; label?: string },
): Promise<void> {
  const floorPx = options?.floorPx ?? MOBILE_TOUCH_TARGET_FLOOR_PX;
  const label = options?.label ?? "control";
  const box = await locator.first().boundingBox();
  expect(box, `${label} must have a bounding box`).not.toBeNull();
  expect(box!.width, `${label} width`).toBeGreaterThanOrEqual(floorPx);
  expect(box!.height, `${label} height`).toBeGreaterThanOrEqual(floorPx);
}
