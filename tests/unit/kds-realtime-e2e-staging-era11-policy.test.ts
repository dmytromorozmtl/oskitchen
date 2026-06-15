import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_REALTIME_E2E_PLAYWRIGHT_SPEC,
  KDS_REALTIME_E2E_STAGING_ERA11_POLICY_ID,
  KDS_REALTIME_E2E_HONEST_SCOPE,
} from "@/lib/kitchen/kds-realtime-e2e-staging-policy";
import {
  KDS_REALTIME_E2E_STAGING_ERA11_PLAYWRIGHT_SPEC,
  KDS_REALTIME_E2E_STAGING_ERA11_IN_DEFAULT_CI,
} from "@/lib/kitchen/kds-realtime-e2e-staging-era11-policy";

const ROOT = process.cwd();

describe("kds realtime e2e staging era11 policy", () => {
  it("locks era11 staging playwright policy id", () => {
    expect(KDS_REALTIME_E2E_STAGING_ERA11_POLICY_ID).toBe(
      "era11-kds-realtime-e2e-staging-v1",
    );
    expect(KDS_REALTIME_E2E_STAGING_ERA11_IN_DEFAULT_CI).toBe(false);
    expect(KDS_REALTIME_E2E_PLAYWRIGHT_SPEC).toBe(KDS_REALTIME_E2E_STAGING_ERA11_PLAYWRIGHT_SPEC);
    expect(KDS_REALTIME_E2E_HONEST_SCOPE.playwrightSpecImplemented).toBe(true);
  });

  it("ships playwright spec on disk", () => {
    expect(existsSync(join(ROOT, KDS_REALTIME_E2E_STAGING_ERA11_PLAYWRIGHT_SPEC))).toBe(true);
  });
});
