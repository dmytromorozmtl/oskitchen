import { describe, expect, it } from "vitest";

import {
  canStorefront,
  storefrontPermissionsForRole,
} from "@/lib/storefront/storefront-permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const packerGranted = workspacePermissionsFromStaffTemplate("PACKER", "STAFF");
const viewOnlyPerms = storefrontPermissionsForRole("STAFF");

describe("storefront platform bypass", () => {
  it("denies legacy storefront bridge when bootstrap email lacks platformBypass", () => {
    expect(
      canStorefront(viewOnlyPerms, "storefront:publish", {
        email: "workspace.moroz@gmail.com",
        workspaceGranted: packerGranted,
        platformBypass: false,
      }),
    ).toBe(false);
    expect(
      canStorefront(viewOnlyPerms, "storefront:edit-draft", {
        email: "workspace.moroz@gmail.com",
        workspaceGranted: packerGranted,
        platformBypass: false,
      }),
    ).toBe(false);
  });

  it("allows legacy storefront bridge when platformBypass is true", () => {
    expect(
      canStorefront(viewOnlyPerms, "storefront:publish", {
        email: "workspace.moroz@gmail.com",
        workspaceGranted: packerGranted,
        platformBypass: true,
      }),
    ).toBe(true);
    expect(
      canStorefront(viewOnlyPerms, "storefront:upload-assets", {
        email: "workspace.moroz@gmail.com",
        workspaceGranted: packerGranted,
        platformBypass: true,
      }),
    ).toBe(true);
  });

  it("preserves owner storefront permissions without platformBypass", () => {
    const ownerPerms = storefrontPermissionsForRole("OWNER");
    expect(canStorefront(ownerPerms, "storefront:publish")).toBe(true);
  });
});
