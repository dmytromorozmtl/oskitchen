import { describe, expect, it } from "vitest";

import { isSuperAdmin } from "@/lib/auth/is-superadmin";
import { canAssignBillingMode, canUseBilling } from "@/lib/billing/billing-permissions";
import { PLATFORM_ROOT_EMAIL } from "@/lib/platform-owner";
import { resolvePlatformPermissions } from "@/lib/platform/platform-permissions";

describe("Superadmin access control", () => {
  it("returns false for no user", () => {
    expect(isSuperAdmin(null)).toBe(false);
    expect(isSuperAdmin(undefined)).toBe(false);
  });

  it("does not grant sync superadmin from bootstrap email alone", () => {
    expect(isSuperAdmin({ email: PLATFORM_ROOT_EMAIL })).toBe(false);
    expect(isSuperAdmin({ email: "operator@example.com" })).toBe(false);
  });

  it("denies billing.mode.write for bootstrap email via sync billing helper", () => {
    expect(canAssignBillingMode({ role: "owner", email: PLATFORM_ROOT_EMAIL })).toBe(false);
    expect(canAssignBillingMode({ role: "owner", email: "owner@example.com" })).toBe(false);
  });

  it("denies billing.mode.write for workspace owner/admin", () => {
    expect(canUseBilling({ role: "owner", email: "owner@example.com" }, "billing.mode.write")).toBe(
      false,
    );
    expect(canUseBilling({ role: "admin", email: "admin@example.com" }, "billing.mode.write")).toBe(
      false,
    );
  });

  it("still allows owners to manage checkout without superadmin", () => {
    expect(canUseBilling({ role: "owner", email: "o@x.com" }, "billing.checkout")).toBe(true);
    expect(canUseBilling({ role: "admin", email: "a@x.com" }, "billing.portal.open")).toBe(true);
  });

  it("grants platform permissions only from SUPER_ADMIN role rows", () => {
    const perms = resolvePlatformPermissions(PLATFORM_ROOT_EMAIL, []);
    expect(perms.has("platform:access")).toBe(false);
    expect(perms.has("platform:billing:write")).toBe(false);

    const superAdminPerms = resolvePlatformPermissions(PLATFORM_ROOT_EMAIL, ["SUPER_ADMIN"]);
    expect(superAdminPerms.has("platform:access")).toBe(true);
    expect(superAdminPerms.has("platform:billing:write")).toBe(true);
  });
});
