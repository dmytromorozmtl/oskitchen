import { describe, expect, it } from "vitest";

import {
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_POLICY_ID,
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_PROOF_STATUS,
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_WORKFLOW,
} from "@/lib/kitchen/kds-staging-playwright-proof-era17-policy";

describe("kds staging playwright proof era17 policy", () => {
  it("locks era17 kds staging playwright proof policy id", () => {
    expect(KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_POLICY_ID).toBe(
      "era17-kds-staging-playwright-proof-v1",
    );
  });

  it("awaits github playwright pass — not certified yet", () => {
    expect(KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_PROOF_STATUS).toBe(
      "awaiting_github_kds_playwright_pass",
    );
    expect(KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_WORKFLOW).toBe(
      ".github/workflows/playwright-kds-staging.yml",
    );
  });
});
