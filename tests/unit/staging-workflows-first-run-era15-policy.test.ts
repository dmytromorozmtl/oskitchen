import { describe, expect, it } from "vitest";

import {
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_EXTENDS_POLICIES,
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_JOB_OMITTED_LABEL,
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_POLICY_ID,
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_WORKFLOWS,
} from "@/lib/ci/staging-workflows-first-run-era15-policy";
import { STAGING_WORKFLOWS_FIRST_RUN_ERA13_POLICY_ID } from "@/lib/ci/staging-workflows-first-run-era13-policy";

describe("staging workflows first-run era15 policy", () => {
  it("locks era15 staging workflows recert policy id", () => {
    expect(STAGING_WORKFLOWS_FIRST_RUN_ERA15_POLICY_ID).toBe(
      "era15-staging-workflows-first-run-recert-v1",
    );
    expect(STAGING_WORKFLOWS_FIRST_RUN_ERA15_EXTENDS_POLICIES).toContain(
      STAGING_WORKFLOWS_FIRST_RUN_ERA13_POLICY_ID,
    );
    expect(STAGING_WORKFLOWS_FIRST_RUN_ERA15_JOB_OMITTED_LABEL).toBe(
      "JOB_OMITTED_SECRETS_MISSING",
    );
    expect(STAGING_WORKFLOWS_FIRST_RUN_ERA15_WORKFLOWS.length).toBe(3);
  });
});
