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

  it("tracks P0 orchestrator as the always-on staging first-green workflow", () => {
    expect(STAGING_WORKFLOWS_FIRST_GREEN_ERA17_TRACKED_WORKFLOWS).toHaveLength(1);
    expect(STAGING_WORKFLOWS_FIRST_GREEN_ERA17_TRACKED_WORKFLOWS[0]?.id).toBe("p0_orchestrator");
    expect(STAGING_WORKFLOWS_FIRST_GREEN_ERA17_PROOF_STATUS).toBe(
      "awaiting_github_first_green",
    );
  });
});
