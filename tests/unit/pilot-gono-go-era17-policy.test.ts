import { describe, expect, it } from "vitest";

import {
  PILOT_GONOGO_ERA17_POLICY_ID,
  PILOT_GONOGO_ERA17_PROOF_STATUS,
} from "@/lib/commercial/pilot-gono-go-era17-policy";

describe("pilot gono-go era17 policy", () => {
  it("locks era17 pilot gono-go policy id", () => {
    expect(PILOT_GONOGO_ERA17_POLICY_ID).toBe("era17-pilot-gono-go-v1");
  });

  it("does not claim customer execution without LOI evidence", () => {
    expect(PILOT_GONOGO_ERA17_PROOF_STATUS).toBe("awaiting_customer_execution");
  });
});
