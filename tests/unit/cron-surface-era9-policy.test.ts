import { describe, expect, it } from "vitest";

import {
  CRON_SURFACE_ERA9_ACTIVE_ROUTE_COUNT,
  CRON_SURFACE_ERA9_EXPERIMENTAL_ON_DISK_MAX,
  CRON_SURFACE_ERA9_EXTENDS_POLICY_ID,
  CRON_SURFACE_ERA9_POLICY_ID,
} from "@/lib/cron/cron-surface-era9-policy";

describe("cron surface era9 policy", () => {
  it("locks era9 cron surface recert policy", () => {
    expect(CRON_SURFACE_ERA9_POLICY_ID).toBe("era9-cron-surface-recert-v1");
    expect(CRON_SURFACE_ERA9_EXTENDS_POLICY_ID).toBe("era4-active-production-only-v1");
    expect(CRON_SURFACE_ERA9_ACTIVE_ROUTE_COUNT).toBe(16);
    expect(CRON_SURFACE_ERA9_EXPERIMENTAL_ON_DISK_MAX).toBe(0);
  });
});
