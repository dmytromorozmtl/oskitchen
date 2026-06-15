import { describe, expect, it } from "vitest";

import {
  bypassesPlanGates,
  canManageChannelCredentials,
  canManageChannelOperations,
} from "@/lib/channels/channel-permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const packerGranted = workspacePermissionsFromStaffTemplate("PACKER", "STAFF");

describe("channels platform bypass", () => {
  it("denies channel manage when bootstrap email lacks platformBypass", () => {
    expect(
      canManageChannelOperations({
        email: "workspace.moroz@gmail.com",
        role: "STAFF",
        granted: packerGranted,
        platformBypass: false,
      }),
    ).toBe(false);
    expect(
      canManageChannelCredentials({
        email: "workspace.moroz@gmail.com",
        role: "STAFF",
        granted: packerGranted,
        platformBypass: false,
      }),
    ).toBe(false);
    expect(bypassesPlanGates(false)).toBe(false);
  });

  it("allows channel manage when platformBypass is true", () => {
    expect(
      canManageChannelOperations({
        email: "workspace.moroz@gmail.com",
        role: "STAFF",
        granted: packerGranted,
        platformBypass: true,
      }),
    ).toBe(true);
    expect(
      canManageChannelCredentials({
        email: "workspace.moroz@gmail.com",
        role: "STAFF",
        granted: packerGranted,
        platformBypass: true,
      }),
    ).toBe(true);
    expect(bypassesPlanGates(true)).toBe(true);
  });

  it("preserves owner channel manage without platformBypass", () => {
    expect(
      canManageChannelOperations({
        email: "owner@example.com",
        role: "OWNER",
      }),
    ).toBe(true);
  });
});
