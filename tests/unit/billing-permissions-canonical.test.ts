import { describe, expect, it } from "vitest";

import {
  billingCapabilityToPermissionKey,
  canUseBilling,
} from "@/lib/billing/billing-permissions";
import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

describe("billing permissions canonical bridge", () => {
  it("maps override writes to billing.manage", () => {
    expect(billingCapabilityToPermissionKey("billing.override.write")).toBe("billing.manage");
    expect(billingCapabilityToPermissionKey("billing.view")).toBe("billing.view");
  });

  it("allows owners through canonical billing.manage grants", () => {
    const granted = defaultPermissionsForWorkspaceRole("OWNER");
    expect(
      canUseBilling({ role: "OWNER", email: "owner@example.com" }, "billing.override.write", {
        granted,
      }),
    ).toBe(true);
    expect(
      canUseBilling({ role: "OWNER", email: "owner@example.com" }, "billing.view", { granted }),
    ).toBe(true);
  });

  it("blocks line cooks even when legacy role strings would not match", () => {
    const granted = workspacePermissionsFromStaffTemplate("LINE_COOK", "STAFF");
    expect(
      canUseBilling({ role: "STAFF", email: "cook@example.com" }, "billing.override.write", {
        granted,
      }),
    ).toBe(false);
  });
});
