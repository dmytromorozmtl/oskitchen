import { describe, expect, it } from "vitest";

import { canManageChannelOperations } from "@/lib/channels/channel-permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

describe("canManageChannelOperations", () => {
  it("allows manager staff with integrations.manage", () => {
    const granted = workspacePermissionsFromStaffTemplate("MANAGER", "STAFF");
    expect(
      canManageChannelOperations({
        email: "mgr@example.com",
        role: "STAFF",
        granted,
      }),
    ).toBe(true);
  });

  it("denies line cook without integrations.manage", () => {
    const granted = workspacePermissionsFromStaffTemplate("LINE_COOK", "STAFF");
    expect(
      canManageChannelOperations({
        email: "cook@example.com",
        role: "STAFF",
        granted,
      }),
    ).toBe(false);
  });

  it("allows owner without explicit granted set", () => {
    expect(
      canManageChannelOperations({
        email: "owner@example.com",
        role: "OWNER",
      }),
    ).toBe(true);
  });
});
