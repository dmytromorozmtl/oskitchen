import { describe, expect, it } from "vitest";

import {
  PERMISSION_DENIED_UX_ERA19_ALL_WIRED_PAGE_PATHS,
  PERMISSION_DENIED_UX_ERA19_POLICY_ID,
  PERMISSION_DENIED_UX_ERA19_SPOTCHECK_SURFACES,
  PERMISSION_DENIED_UX_ERA19_WIRED_PAGE_PATHS,
} from "@/lib/ux/permission-denied-era19-policy";
import { PERMISSION_DENIED_UX_ERA17_POLICY_ID } from "@/lib/ux/permission-denied-era17-policy";

describe("permission-denied-era19 policy", () => {
  it("extends era17 permission denied ux", () => {
    expect(PERMISSION_DENIED_UX_ERA19_POLICY_ID).toBe(
      "era19-permission-denied-packing-production-v1",
    );
    expect(PERMISSION_DENIED_UX_ERA19_ALL_WIRED_PAGE_PATHS.length).toBeGreaterThan(4);
  });

  it("defines packing and production spotcheck surfaces", () => {
    expect(PERMISSION_DENIED_UX_ERA19_SPOTCHECK_SURFACES).toEqual([
      "packing_command",
      "packing_verify",
      "production_calendar",
      "production_board",
    ]);
    expect(PERMISSION_DENIED_UX_ERA19_WIRED_PAGE_PATHS).toHaveLength(4);
  });

  it("chains to era17 policy id", () => {
    expect(PERMISSION_DENIED_UX_ERA17_POLICY_ID).toBe("era17-permission-denied-ux-v1");
  });
});
