import { describe, expect, it } from "vitest";

import {
  PERMISSION_DENIED_UX_ERA20_CYCLE17_BACKLOG_ID,
  PERMISSION_DENIED_UX_ERA20_CYCLE17_CI_SCRIPTS,
  PERMISSION_DENIED_UX_ERA20_CYCLE17_SPOTCHECK_SURFACES,
} from "@/lib/ux/permission-denied-ux-era20-cycle17-policy";

describe("permission-denied-ux-era20-cycle17-cert-live", () => {
  it("locks cert bundle", () => {
    expect(PERMISSION_DENIED_UX_ERA20_CYCLE17_BACKLOG_ID).toBe("KOS-E20-017");
    expect(PERMISSION_DENIED_UX_ERA20_CYCLE17_SPOTCHECK_SURFACES).toContain("copilot_hub");
    expect(PERMISSION_DENIED_UX_ERA20_CYCLE17_CI_SCRIPTS).toContain(
      "test:ci:permission-denied-ux-era20-cycle17",
    );
  });
});
