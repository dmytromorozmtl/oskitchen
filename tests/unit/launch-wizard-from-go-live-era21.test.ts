import { describe, expect, it } from "vitest";

import {
  buildLaunchWizardFromGoLiveBannerModel,
  LAUNCH_WIZARD_FROM_GO_LIVE_ERA21_POLICY_ID,
  resolveLaunchWizardFromGoLiveRedirect,
} from "@/lib/launch-wizard/launch-wizard-from-go-live-era21";

describe("launch-wizard-from-go-live-era21", () => {
  it("detects go-live redirect query", () => {
    expect(resolveLaunchWizardFromGoLiveRedirect("go-live")).toBe(true);
    expect(resolveLaunchWizardFromGoLiveRedirect(undefined)).toBe(false);
  });

  it("builds visible banner with advanced go-live escape hatch", () => {
    const model = buildLaunchWizardFromGoLiveBannerModel({ fromGoLive: true });
    expect(model.visible).toBe(true);
    expect(model.advancedGoLiveHref).toContain("mode=advanced");
    expect(model.commercialBlockersHref).toContain("#");
  });

  it("hides banner without redirect", () => {
    expect(buildLaunchWizardFromGoLiveBannerModel({ fromGoLive: false }).visible).toBe(false);
  });

  it("locks policy id", () => {
    expect(LAUNCH_WIZARD_FROM_GO_LIVE_ERA21_POLICY_ID).toBe("era21-launch-wizard-from-go-live-v1");
  });
});
