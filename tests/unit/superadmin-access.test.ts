import { describe, expect, it } from "vitest";

import { isSuperAdmin } from "@/lib/auth/is-superadmin";
import { canAssignBillingMode, canUseBilling } from "@/lib/billing/billing-permissions";
import { PLATFORM_ROOT_EMAIL } from "@/lib/platform-owner";

describe("Superadmin access control", () => {
  it("returns false for no user", () => {
    expect(isSuperAdmin(null)).toBe(false);
    expect(isSuperAdmin(undefined)).toBe(false);
  });

  it("returns false for regular workspace roles", () => {
    expect(isSuperAdmin({ email: "operator@example.com" })).toBe(false);
    expect(canAssignBillingMode({ role: "owner", email: "owner@example.com" })).toBe(false);
    expect(canAssignBillingMode({ role: "admin", email: "admin@example.com" })).toBe(false);
    expect(canAssignBillingMode({ role: "manager", email: "manager@example.com" })).toBe(false);
  });

  it("returns true for platform root email", () => {
    expect(isSuperAdmin({ email: PLATFORM_ROOT_EMAIL })).toBe(true);
    expect(canAssignBillingMode({ role: "owner", email: PLATFORM_ROOT_EMAIL })).toBe(true);
  });

  it("denies billing.mode.write for workspace owner/admin", () => {
    expect(canUseBilling({ role: "owner", email: "owner@example.com" }, "billing.mode.write")).toBe(
      false,
    );
    expect(canUseBilling({ role: "admin", email: "admin@example.com" }, "billing.mode.write")).toBe(
      false,
    );
  });

  it("allows billing.mode.write only for platform superadmin", () => {
    expect(
      canUseBilling({ role: "staff", email: PLATFORM_ROOT_EMAIL }, "billing.mode.write"),
    ).toBe(true);
  });

  it("still allows owners to manage checkout without superadmin", () => {
    expect(canUseBilling({ role: "owner", email: "o@x.com" }, "billing.checkout")).toBe(true);
    expect(canUseBilling({ role: "admin", email: "a@x.com" }, "billing.portal.open")).toBe(true);
  });
});
