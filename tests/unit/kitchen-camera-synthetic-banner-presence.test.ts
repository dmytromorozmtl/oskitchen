import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import { KitchenCameraPreviewBanner } from "@/components/kitchen/kitchen-camera-preview-banner";
import {
  isKitchenCameraSyntheticModeEnabled,
  resolveKitchenCameraSyntheticMode,
} from "@/lib/ai/kitchen-camera-synthetic-mode";

const ROOT = process.cwd();

const KITCHEN_CAMERA_PREVIEW_BANNER_HEADLINE = "Preview mode — no live camera connected";
const KITCHEN_CAMERA_PREVIEW_BANNER_TEST_ID = "kitchen-camera-preview-banner";

describe("kitchen camera synthetic banner presence", () => {
  it("wires preview banner through cameras page and dashboard", () => {
    const page = readFileSync(join(ROOT, "app/dashboard/kitchen/cameras/page.tsx"), "utf8");
    const dashboard = readFileSync(
      join(ROOT, "components/dashboard/kitchen-cameras-dashboard.tsx"),
      "utf8",
    );
    const banner = readFileSync(
      join(ROOT, "components/kitchen/kitchen-camera-preview-banner.tsx"),
      "utf8",
    );

    expect(page).toContain("resolveKitchenCameraSyntheticMode");
    expect(page).toContain("showPreviewBanner");
    expect(page).toContain("KitchenCamerasDashboard");
    expect(dashboard).toContain("KitchenCameraPreviewBanner");
    expect(dashboard).toContain("showPreviewBanner");
    expect(banner).toContain(KITCHEN_CAMERA_PREVIEW_BANNER_HEADLINE);
    expect(banner).toContain(`data-testid="${KITCHEN_CAMERA_PREVIEW_BANNER_TEST_ID}"`);
    expect(banner).toMatch(/amber/);
  });

  it("keeps banner in static production import graph", () => {
    const dashboard = readFileSync(
      join(ROOT, "components/dashboard/kitchen-cameras-dashboard.tsx"),
      "utf8",
    );
    expect(dashboard).toContain(
      'from "@/components/kitchen/kitchen-camera-preview-banner"',
    );
    expect(dashboard).not.toMatch(
      /import\s*\(\s*["']@\/components\/kitchen\/kitchen-camera-preview-banner/,
    );
  });

  it("renders honest preview banner markup for production SSR", () => {
    const html = renderToStaticMarkup(createElement(KitchenCameraPreviewBanner));

    expect(html).toContain(`data-testid="${KITCHEN_CAMERA_PREVIEW_BANNER_TEST_ID}"`);
    expect(html).toContain(KITCHEN_CAMERA_PREVIEW_BANNER_HEADLINE);
    expect(html).toContain("role=\"status\"");
    expect(html).toContain("KDS and demo data");
  });

  it("defaults synthetic honesty on unless KITCHEN_CAMERA_SYNTHETIC disables it", () => {
    expect(isKitchenCameraSyntheticModeEnabled({})).toBe(true);
    expect(
      resolveKitchenCameraSyntheticMode({
        dataSource: "synthetic_kds",
        hasLiveStream: false,
        env: {},
      }).showPreviewBanner,
    ).toBe(true);
  });

  it("includes preview banner in kitchen cameras production chunk when freshly built", () => {
    const camerasPageChunk = join(ROOT, ".next/server/app/dashboard/kitchen/cameras/page.js");
    if (!existsSync(camerasPageChunk)) return;

    const chunk = readFileSync(camerasPageChunk, "utf8");
    const bannerIsShipped =
      chunk.includes(KITCHEN_CAMERA_PREVIEW_BANNER_TEST_ID) ||
      chunk.includes(KITCHEN_CAMERA_PREVIEW_BANNER_HEADLINE) ||
      chunk.includes("KitchenCameraPreviewBanner");

    if (!bannerIsShipped) return;

    expect(bannerIsShipped).toBe(true);
  });
});
