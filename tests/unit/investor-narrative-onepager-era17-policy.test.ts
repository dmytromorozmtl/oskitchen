import { describe, expect, it } from "vitest";

import {
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_POLICY_ID,
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_PROOF_STATUS,
} from "@/lib/commercial/investor-narrative-onepager-era17-policy";

describe("investor narrative onepager era17 policy", () => {
  it("locks era17 investor narrative onepager policy id", () => {
    expect(INVESTOR_NARRATIVE_ONEPAGER_ERA17_POLICY_ID).toBe(
      "era17-investor-narrative-onepager-v2-v1",
    );
  });

  it("does not claim live metrics without pilot baseline", () => {
    expect(INVESTOR_NARRATIVE_ONEPAGER_ERA17_PROOF_STATUS).toBe(
      "template_only_awaiting_pilot_metrics",
    );
  });
});
