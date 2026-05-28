import { describe, expect, it } from "vitest";

import {
  PUBLIC_POST_ABUSE_ERA17_BACKLOG_ID,
  PUBLIC_POST_ABUSE_ERA17_HARDENED_ROUTES,
  PUBLIC_POST_ABUSE_ERA17_POLICY_ID,
  PUBLIC_POST_ABUSE_ERA17_PROOF_STATUS,
} from "@/lib/security/public-post-abuse-era17-policy";

describe("public POST abuse era17 policy", () => {
  it("locks policy id and proof status", () => {
    expect(PUBLIC_POST_ABUSE_ERA17_POLICY_ID).toBe("era17-public-post-abuse-v1");
    expect(PUBLIC_POST_ABUSE_ERA17_PROOF_STATUS).toBe("p1_public_post_guards_expanded");
    expect(PUBLIC_POST_ABUSE_ERA17_BACKLOG_ID).toBe("KOS-E17-023");
    expect(PUBLIC_POST_ABUSE_ERA17_HARDENED_ROUTES).toHaveLength(6);
  });
});
