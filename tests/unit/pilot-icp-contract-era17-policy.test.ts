import { describe, expect, it } from "vitest";

import {
  PILOT_ICP_CONTRACT_ERA17_POLICY_ID,
  PILOT_ICP_CONTRACT_ERA17_STATUS,
} from "@/lib/commercial/pilot-icp-contract-era17-policy";

describe("pilot icp contract era17 policy", () => {
  it("locks era17 pilot ICP contract policy id", () => {
    expect(PILOT_ICP_CONTRACT_ERA17_POLICY_ID).toBe("era17-pilot-icp-contract-v1");
  });

  it("marks template ready without signed customer claim", () => {
    expect(PILOT_ICP_CONTRACT_ERA17_STATUS).toBe("template_ready");
  });
});
