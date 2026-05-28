import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_STAGING_SMOKE_ERA15_INTEGRATION_STAGES,
  KDS_STAGING_SMOKE_ERA15_INTEGRATION_TESTS,
  KDS_STAGING_SMOKE_ERA15_POLICY_ID,
  KDS_STAGING_SMOKE_ERA15_REALTIME_PLAYWRIGHT_IN_DEFAULT_CI,
} from "@/lib/kitchen/kds-staging-smoke-era15-policy";

const ROOT = process.cwd();

describe("KDS staging smoke era15 policy", () => {
  it("locks era15 KDS staging smoke recert policy id", () => {
    expect(KDS_STAGING_SMOKE_ERA15_POLICY_ID).toBe("era15-kds-staging-smoke-recert-v1");
    expect(KDS_STAGING_SMOKE_ERA15_REALTIME_PLAYWRIGHT_IN_DEFAULT_CI).toBe(false);
  });

  it("retains bump and recall integration stages from era10 recert", () => {
    expect(KDS_STAGING_SMOKE_ERA15_INTEGRATION_STAGES).toContain("bump_to_ready");
    expect(KDS_STAGING_SMOKE_ERA15_INTEGRATION_STAGES).toContain("recall_to_preparing");
    for (const rel of KDS_STAGING_SMOKE_ERA15_INTEGRATION_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    const integration = readFileSync(
      join(ROOT, KDS_STAGING_SMOKE_ERA15_INTEGRATION_TESTS[0]!),
      "utf8",
    );
    expect(integration).toContain("recall");
    expect(integration).toContain("bump");
  });
});
