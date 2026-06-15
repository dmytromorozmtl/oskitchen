import { describe, expect, it } from "vitest";

import {
  canManageBrands,
  canManageSingleBrand,
  canViewAllBrands,
} from "@/lib/brands/brand-permissions";
import { resolveBrandActorScope } from "@/lib/brands/resolve-brand-actor-scope";

describe("brands platform bypass", () => {
  it("denies brand superadmin bridge when bootstrap email lacks platformBypass", () => {
    const scope = {
      isWorkspaceOwner: false,
      email: "workspace.moroz@gmail.com",
      platformBypass: false,
    };

    expect(canViewAllBrands(scope)).toBe(false);
    expect(canManageBrands(scope)).toBe(false);
    expect(
      canManageSingleBrand({ ...scope, brandId: "brand-1", assignedBrandIds: [] }),
    ).toBe(false);
  });

  it("allows brand superadmin bridge when platformBypass is true", () => {
    const scope = {
      isWorkspaceOwner: false,
      email: "workspace.moroz@gmail.com",
      platformBypass: true,
    };

    expect(canViewAllBrands(scope)).toBe(true);
    expect(canManageBrands(scope)).toBe(true);
    expect(canManageSingleBrand({ ...scope, brandId: "brand-1" })).toBe(true);
  });

  it("passes platformBypass from workspace actor into brand scope", () => {
    const scope = resolveBrandActorScope({
      workspaceRole: "STAFF",
      email: "workspace.moroz@gmail.com",
      platformBypass: true,
    });

    expect(scope.platformBypass).toBe(true);
    expect(canManageBrands(scope)).toBe(true);
  });

  it("preserves owner brand access without platformBypass", () => {
    const scope = resolveBrandActorScope({
      workspaceRole: "OWNER",
      email: "owner@example.com",
    });

    expect(canManageBrands(scope)).toBe(true);
    expect(canManageSingleBrand({ ...scope, brandId: "brand-1" })).toBe(true);
  });

  it("preserves assigned-brand access without platformBypass", () => {
    const scope = resolveBrandActorScope({
      workspaceRole: "STAFF",
      email: "staff@example.com",
      assignedBrandIds: ["brand-1"],
    });

    expect(canManageSingleBrand({ ...scope, brandId: "brand-1" })).toBe(true);
    expect(canManageSingleBrand({ ...scope, brandId: "brand-2" })).toBe(false);
  });
});
