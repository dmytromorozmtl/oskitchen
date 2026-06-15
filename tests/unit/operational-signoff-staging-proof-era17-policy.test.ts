import { describe, expect, it } from "vitest";

import {
  OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_POLICY_ID,
  OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_PROOF_STATUS,
} from "@/lib/operations/operational-signoff-staging-proof-era17-policy";

describe("operational signoff staging proof era17 policy", () => {
  it("locks era17 operational signoff staging proof policy id", () => {
    expect(OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_POLICY_ID).toBe(
      "era17-operational-signoff-staging-proof-v1",
    );
  });

  it("awaits staging operator signoff — not fully certified yet", () => {
    expect(OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_PROOF_STATUS).toBe(
      "awaiting_staging_operator_signoff",
    );
  });
});
