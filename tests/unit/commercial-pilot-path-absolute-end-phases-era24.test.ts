import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC,
  PATH_ABSOLUTE_END_GUARDRAILS,
  PATH_ABSOLUTE_END_LAYERS,
  STEADY_STATE_PRODUCT_SURFACES,
  resolveCommercialPilotPathAbsoluteEndPrerequisites,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-phases-era24";

describe("commercial-pilot-path-absolute-end-phases-era24", () => {
  it("defines four path closure layers and seven product surfaces", () => {
    expect(PATH_ABSOLUTE_END_LAYERS).toHaveLength(4);
    expect(STEADY_STATE_PRODUCT_SURFACES).toHaveLength(7);
    expect(PATH_ABSOLUTE_END_GUARDRAILS.length).toBeGreaterThanOrEqual(6);
    expect(COMMERCIAL_PILOT_PATH_ABSOLUTE_END_STEP15_DOC).toContain("next-step-15");
  });

  it("requires steady state for absolute end", () => {
    expect(
      resolveCommercialPilotPathAbsoluteEndPrerequisites({ steadyStateActive: false })
        .absoluteEndActive,
    ).toBe(false);
    expect(
      resolveCommercialPilotPathAbsoluteEndPrerequisites({ steadyStateActive: true })
        .absoluteEndActive,
    ).toBe(true);
    expect(
      resolveCommercialPilotPathAbsoluteEndPrerequisites({ steadyStateActive: true })
        .pathEngineeringClosed,
    ).toBe(true);
  });
});
