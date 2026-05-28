import { describe, expect, it } from "vitest";

import {
  PERMISSION_DENIED_UX_ERA20_CYCLE10_BACKLOG_ID,
  PERMISSION_DENIED_UX_ERA20_CYCLE10_CI_SCRIPTS,
  PERMISSION_DENIED_UX_ERA20_CYCLE10_POLICY_ID,
  PERMISSION_DENIED_UX_ERA20_CYCLE10_SPOTCHECK_SURFACES,
  PERMISSION_DENIED_UX_ERA20_CYCLE10_WIRED_PAGE_PATHS,
} from "@/lib/ux/permission-denied-ux-era20-cycle10-policy";

describe("permission-denied-ux-era20-cycle10-cert-live", () => {
  it("locks era20 cycle10 permission denied cert bundle", () => {
    expect(PERMISSION_DENIED_UX_ERA20_CYCLE10_POLICY_ID).toBe(
      "era20-permission-denied-pilot-hubs-cycle10-v1",
    );
    expect(PERMISSION_DENIED_UX_ERA20_CYCLE10_BACKLOG_ID).toBe("KOS-E20-010");
    expect(PERMISSION_DENIED_UX_ERA20_CYCLE10_WIRED_PAGE_PATHS).toHaveLength(5);
    expect(PERMISSION_DENIED_UX_ERA20_CYCLE10_SPOTCHECK_SURFACES).toContain("staff_hub");
    expect(PERMISSION_DENIED_UX_ERA20_CYCLE10_CI_SCRIPTS).toContain(
      "test:ci:permission-denied-ux-era20-cycle10",
    );
  });
});
