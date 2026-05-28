import { describe, expect, it } from "vitest";

import {
  POS_TABLET_UX_ERA17_BACKLOG_ID,
  POS_TABLET_UX_ERA17_FORBIDDEN_CLAIMS,
  POS_TABLET_UX_ERA17_POLICY_ID,
  POS_TABLET_UX_ERA17_PROOF_STATUS,
} from "@/lib/pos/pos-tablet-ux-era17-policy";

describe("POS tablet UX era17 policy", () => {
  it("locks era17 POS tablet UX policy id", () => {
    expect(POS_TABLET_UX_ERA17_POLICY_ID).toBe("era17-pos-tablet-ux-v1");
    expect(POS_TABLET_UX_ERA17_PROOF_STATUS).toBe("tablet_ux_polished");
    expect(POS_TABLET_UX_ERA17_BACKLOG_ID).toBe("KOS-E17-020");
  });

  it("forbids hardware and offline POS claims", () => {
    expect(POS_TABLET_UX_ERA17_FORBIDDEN_CLAIMS).toContain("offline pos production ready");
    expect(POS_TABLET_UX_ERA17_FORBIDDEN_CLAIMS).toContain("hardware pos certified");
  });
});
