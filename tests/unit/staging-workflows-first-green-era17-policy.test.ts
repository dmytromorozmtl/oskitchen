import { describe, expect, it } from "vitest";

import {
  STAGING_WORKFLOWS_FIRST_GREEN_ERA17_POLICY_ID,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA17_PROOF_STATUS,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA17_TRACKED_WORKFLOWS,
} from "@/lib/ci/staging-workflows-first-green-era17-policy";

describe("staging workflows first green era17 policy", () => {
  it("locks era17 staging workflows first green policy id", () => {
    expect(STAGING_WORKFLOWS_FIRST_GREEN_ERA17_POLICY_ID).toBe(
      "era17-staging-workflows-first-green-v1",
    );
  });

  it("tracks three optional GitHub staging workflows", () => {
    expect(STAGING_WORKFLOWS_FIRST_GREEN_ERA17_TRACKED_WORKFLOWS).toHaveLength(3);
    expect(STAGING_WORKFLOWS_FIRST_GREEN_ERA17_PROOF_STATUS).toBe(
      "awaiting_github_first_green",
    );
  });
});
