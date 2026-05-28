import { describe, expect, it } from "vitest";

import {
  P0_STAGING_PROOF_UNBLOCK_ERA17_CHILD_SMOKES,
  P0_STAGING_PROOF_UNBLOCK_ERA17_FORBIDDEN_CLAIMS,
  P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
  P0_STAGING_PROOF_UNBLOCK_ERA17_PROOF_STATUS,
  P0_STAGING_PROOF_UNBLOCK_ERA17_UNBLOCK_STEPS,
} from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";

describe("p0 staging proof unblock era17 policy", () => {
  it("locks era17 p0 staging proof unblock policy id", () => {
    expect(P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID).toBe(
      "era17-p0-staging-proof-unblock-v1",
    );
  });

  it("does not claim p0 proof passed without child artifacts", () => {
    expect(P0_STAGING_PROOF_UNBLOCK_ERA17_PROOF_STATUS).toBe("awaiting_ops_credentials");
    expect(P0_STAGING_PROOF_UNBLOCK_ERA17_FORBIDDEN_CLAIMS).toContain(
      "p0 staging proof passed without child artifacts",
    );
  });

  it("orchestrates the three P0 staging smokes in priority order", () => {
    expect(P0_STAGING_PROOF_UNBLOCK_ERA17_CHILD_SMOKES).toEqual([
      "smoke:enterprise-sso-idp-staging",
      "smoke:staging-workflows-first-green",
      "smoke:woo-shopify-live",
    ]);
    expect(P0_STAGING_PROOF_UNBLOCK_ERA17_UNBLOCK_STEPS.length).toBeGreaterThanOrEqual(4);
  });
});
