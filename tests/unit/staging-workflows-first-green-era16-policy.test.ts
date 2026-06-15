import { describe, expect, it } from "vitest";

import {
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_OPTIONAL_WORKFLOWS,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_POLICY_ID,
} from "@/lib/ci/staging-workflows-first-green-era16-policy";

describe("staging workflows first green era16 policy", () => {
  it("locks era16 staging workflows first green policy id", () => {
    expect(STAGING_WORKFLOWS_FIRST_GREEN_ERA16_POLICY_ID).toBe(
      "era16-staging-workflows-first-green-v1",
    );
  });

  it("includes era13 staging workflows plus woo-shopify staging smoke", () => {
    expect(STAGING_WORKFLOWS_FIRST_GREEN_ERA16_OPTIONAL_WORKFLOWS).toContain(
      ".github/workflows/e2e-staging.yml",
    );
    expect(STAGING_WORKFLOWS_FIRST_GREEN_ERA16_OPTIONAL_WORKFLOWS).toContain(
      ".github/workflows/playwright-kds-staging.yml",
    );
    expect(STAGING_WORKFLOWS_FIRST_GREEN_ERA16_OPTIONAL_WORKFLOWS).toContain(
      ".github/workflows/woo-shopify-staging-smoke.yml",
    );
  });
});
