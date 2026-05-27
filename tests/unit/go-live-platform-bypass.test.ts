import { describe, expect, it } from "vitest";

import {
  canUseGoLive,
  isSuperAdminGoLive,
} from "@/lib/go-live/go-live-permissions";
import { resolveGoLiveActorScope } from "@/lib/go-live/resolve-go-live-actor-scope";

describe("go-live platform bypass", () => {
  it("denies go-live superadmin bridge when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: false,
    };

    expect(isSuperAdminGoLive(scope)).toBe(false);
    expect(canUseGoLive(scope, "go-live.unlock")).toBe(false);
    expect(canUseGoLive(scope, "go-live.launch")).toBe(false);
  });

  it("allows go-live superadmin bridge when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: true,
    };

    expect(isSuperAdminGoLive(scope)).toBe(true);
    expect(canUseGoLive(scope, "go-live.unlock")).toBe(true);
    expect(canUseGoLive(scope, "go-live.launch")).toBe(true);
  });

  it("passes platformBypass from workspace actor into go-live scope", () => {
    const scope = resolveGoLiveActorScope({
      workspaceRole: "STAFF",
      email: "workspace.moroz@gmail.com",
      profileRole: "staff",
      profileEmail: "workspace.moroz@gmail.com",
      platformBypass: true,
    });

    expect(scope.platformBypass).toBe(true);
    expect(canUseGoLive(scope, "go-live.rollback")).toBe(true);
  });

  it("preserves owner go-live access without platformBypass", () => {
    const scope = resolveGoLiveActorScope({
      workspaceRole: "OWNER",
      email: "owner@example.com",
      profileRole: "OWNER",
      profileEmail: "owner@example.com",
    });

    expect(canUseGoLive(scope, "go-live.launch")).toBe(true);
    expect(canUseGoLive(scope, "go-live.unlock")).toBe(true);
  });
});
