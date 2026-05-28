import { describe, expect, it } from "vitest";

import {
  KDS_REALTIME_E2E_STAGING_WORKFLOW_ERA11_POLICY_ID,
  KDS_REALTIME_E2E_STAGING_WORKFLOW_FILE,
  KDS_REALTIME_E2E_STAGING_WORKFLOW_IN_DEFAULT_CI,
  KDS_REALTIME_E2E_STAGING_WORKFLOW_JOB_ID,
} from "@/lib/ci/kds-realtime-e2e-staging-workflow-era11-policy";

describe("kds realtime e2e staging workflow era11 policy", () => {
  it("locks era11 staging workflow policy id", () => {
    expect(KDS_REALTIME_E2E_STAGING_WORKFLOW_ERA11_POLICY_ID).toBe(
      "era11-kds-realtime-e2e-staging-workflow-v1",
    );
    expect(KDS_REALTIME_E2E_STAGING_WORKFLOW_IN_DEFAULT_CI).toBe(false);
    expect(KDS_REALTIME_E2E_STAGING_WORKFLOW_FILE).toBe(
      ".github/workflows/playwright-kds-staging.yml",
    );
    expect(KDS_REALTIME_E2E_STAGING_WORKFLOW_JOB_ID).toBe("kds-realtime-staging");
  });
});
