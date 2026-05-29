import { describe, expect, it } from "vitest";

import { buildEra25EngineeringGatesUiSlice } from "@/lib/commercial/era25-engineering-gates-ui-era24";
import {
  buildOwnerDailyBriefingEra25FirstProductSliceBlueprintAction,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_BRIEFING_ACTION_PRIORITY,
  mergeBriefingEra25FirstProductSliceBlueprintTopActions,
} from "@/lib/briefing/owner-daily-briefing-era25-first-product-slice-blueprint-era45";

describe("owner-daily-briefing-era25-first-product-slice-blueprint-era45", () => {
  it("ranks blueprint action at priority 20", () => {
    const gates = buildEra25EngineeringGatesUiSlice({ readinessVisible: true, env: {} });
    const action = buildOwnerDailyBriefingEra25FirstProductSliceBlueprintAction(
      gates?.firstProductSliceBlueprint ?? null,
    );
    expect(action).not.toBeNull();
    expect(action!.priority).toBe(ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_BRIEFING_ACTION_PRIORITY);
    expect(action!.id).toBe("era25-first-product-slice-blueprint");
  });

  it("merges blueprint action ahead of lower-priority briefing items", () => {
    const gates = buildEra25EngineeringGatesUiSlice({ readinessVisible: true, env: {} });
    const blueprintAction = buildOwnerDailyBriefingEra25FirstProductSliceBlueprintAction(
      gates?.firstProductSliceBlueprint ?? null,
    );
    const merged = mergeBriefingEra25FirstProductSliceBlueprintTopActions(blueprintAction, [
      {
        id: "other",
        title: "Other",
        reason: "x",
        severity: "normal",
        ownerRole: "owner",
        href: "/x",
        status: "open",
        unblockCondition: "y",
        priority: 50,
        ctaLabel: "Open",
        tone: "normal",
      },
    ]);
    expect(merged[0]?.id).toBe("era25-first-product-slice-blueprint");
  });
});
