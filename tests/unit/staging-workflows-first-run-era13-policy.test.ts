import { describe, expect, it } from "vitest";

import {
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_JOB_OMITTED_LABEL,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_POLICY_ID,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_WORKFLOWS,
} from "@/lib/ci/staging-workflows-first-run-era13-policy";

describe("staging workflows first-run era13 policy", () => {
  it("locks era13 staging workflows first-run ops policy id", () => {
    expect(STAGING_WORKFLOWS_FIRST_RUN_ERA13_POLICY_ID).toBe(
      "era13-staging-workflows-first-run-ops-v1",
    );
    expect(STAGING_WORKFLOWS_FIRST_RUN_ERA13_JOB_OMITTED_LABEL).toBe(
      "JOB_OMITTED_SECRETS_MISSING",
    );
  });

  it("covers the three optional staging workflows", () => {
    const paths = STAGING_WORKFLOWS_FIRST_RUN_ERA13_WORKFLOWS.map((w) => w.workflow);
    expect(paths).toContain(".github/workflows/e2e-staging.yml");
    expect(paths).toContain(".github/workflows/playwright-kds-staging.yml");
    expect(paths).toContain(".github/workflows/closed-beta-gate.yml");
  });
});
