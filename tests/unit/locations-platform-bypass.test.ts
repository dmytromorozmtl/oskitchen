import { describe, expect, it } from "vitest";

import { resolveLocationActorScope } from "@/lib/locations/resolve-location-actor-scope";
import {
  canDoLocation,
  isSuperAdmin,
  visibleLocationIds,
} from "@/lib/locations/location-permissions";

describe("locations platform bypass", () => {
  it("denies location superadmin bridge when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: false,
    };

    expect(isSuperAdmin(scope)).toBe(false);
    expect(canDoLocation(scope, "location.create")).toBe(false);
    expect(canDoLocation(scope, "location.archive")).toBe(false);
    expect(visibleLocationIds(scope)).toEqual([]);
  });

  it("allows location superadmin bridge when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: true,
    };

    expect(isSuperAdmin(scope)).toBe(true);
    expect(canDoLocation(scope, "location.create")).toBe(true);
    expect(canDoLocation(scope, "location.manage_orders")).toBe(true);
    expect(visibleLocationIds(scope)).toBeNull();
  });

  it("passes platformBypass from workspace actor into location scope", () => {
    const scope = resolveLocationActorScope({
      workspaceRole: "STAFF",
      email: "workspace.moroz@gmail.com",
      profileRole: "staff",
      profileEmail: "workspace.moroz@gmail.com",
      platformBypass: true,
    });

    expect(scope.platformBypass).toBe(true);
    expect(canDoLocation(scope, "location.assign")).toBe(true);
  });

  it("preserves owner location access without platformBypass", () => {
    const scope = resolveLocationActorScope({
      workspaceRole: "OWNER",
      email: "owner@example.com",
      profileRole: "OWNER",
      profileEmail: "owner@example.com",
    });

    expect(canDoLocation(scope, "location.archive")).toBe(true);
    expect(visibleLocationIds(scope)).toBeNull();
  });

  it("preserves allowed-location scoping without platformBypass", () => {
    const scope = resolveLocationActorScope({
      workspaceRole: "STAFF",
      email: "staff@example.com",
      profileRole: "manager",
      profileEmail: "staff@example.com",
      allowedLocationIds: ["loc-1"],
    });

    expect(visibleLocationIds(scope)).toEqual(["loc-1"]);
    expect(canDoLocation(scope, "location.update")).toBe(true);
  });
});
