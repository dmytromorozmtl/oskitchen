import { describe, expect, it } from "vitest";

import {
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_POLICY_ID,
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_PROOF_STATUS,
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_WORKFLOW,
} from "@/lib/integrations/channel-github-workflow-first-green-era17-policy";

describe("channel github workflow first green era17 policy", () => {
  it("locks era17 channel GitHub workflow policy id", () => {
    expect(CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_POLICY_ID).toBe(
      "era17-channel-github-workflow-first-green-v1",
    );
  });

  it("awaits github first green with woo-shopify workflow", () => {
    expect(CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_PROOF_STATUS).toBe(
      "awaiting_github_first_green",
    );
    expect(CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_WORKFLOW).toContain(
      "woo-shopify-staging-smoke.yml",
    );
  });
});
