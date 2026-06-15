import { describe, expect, it } from "vitest";

import {
  PERMISSION_DENIED_UX_ERA17_BACKLOG_ID,
  PERMISSION_DENIED_UX_ERA17_POLICY_ID,
  PERMISSION_DENIED_UX_ERA17_PROOF_STATUS,
  PERMISSION_DENIED_UX_ERA17_TEST_ID,
} from "@/lib/ux/permission-denied-era17-policy";

describe("permission denied ux era17 policy", () => {
  it("locks era17 permission denied ux policy id", () => {
    expect(PERMISSION_DENIED_UX_ERA17_POLICY_ID).toBe("era17-permission-denied-ux-v1");
    expect(PERMISSION_DENIED_UX_ERA17_PROOF_STATUS).toBe("permission_denied_ux_consistent");
    expect(PERMISSION_DENIED_UX_ERA17_BACKLOG_ID).toBe("KOS-E17-032");
    expect(PERMISSION_DENIED_UX_ERA17_TEST_ID).toBe("permission-denied-card");
  });
});
