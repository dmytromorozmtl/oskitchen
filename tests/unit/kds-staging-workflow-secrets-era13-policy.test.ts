import { describe, expect, it } from "vitest";

import { KDS_STAGING_WORKFLOW_SECRETS_ERA13_POLICY_ID } from "@/lib/ci/kds-staging-workflow-secrets-era13-policy";

describe("kds staging workflow secrets era13 policy", () => {
  it("locks era13 kds staging workflow secrets alignment policy id", () => {
    expect(KDS_STAGING_WORKFLOW_SECRETS_ERA13_POLICY_ID).toBe(
      "era13-kds-staging-workflow-secrets-align-v1",
    );
  });
});
