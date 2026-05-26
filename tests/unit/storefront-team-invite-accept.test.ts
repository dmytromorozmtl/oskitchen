import { describe, expect, it } from "vitest";

import {
  mergePendingInvites,
  parseStorefrontPendingInvites,
} from "@/lib/storefront/storefront-team-invites";

describe("storefront team invites", () => {
  it("parses and merges pending invites", () => {
    const center = mergePendingInvites(null, [
      {
        id: "00000000-0000-4000-8000-000000000001",
        email: "chef@example.com",
        role: "STAFF",
        invitedAt: new Date().toISOString(),
        invitedByUserId: "00000000-0000-4000-8000-000000000002",
      },
    ]);
    const invites = parseStorefrontPendingInvites(center);
    expect(invites).toHaveLength(1);
    expect(invites[0]?.email).toBe("chef@example.com");
  });
});
