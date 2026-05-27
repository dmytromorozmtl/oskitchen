import { describe, expect, it } from "vitest";

import { resolveTaskActorScope } from "@/lib/tasks/resolve-task-actor-scope";
import {
  actorIsSuperAdmin,
  canDoTask,
} from "@/lib/tasks/task-permissions";

describe("tasks platform bypass", () => {
  it("denies task superadmin bridge when bootstrap email lacks platformBypass", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: false,
    };

    expect(actorIsSuperAdmin(scope)).toBe(false);
    expect(canDoTask(scope, "task.template.manage")).toBe(false);
    expect(canDoTask(scope, "task.bulk.update")).toBe(false);
  });

  it("allows task superadmin bridge when platformBypass is true", () => {
    const scope = {
      isOwner: false,
      role: "staff",
      email: "workspace.moroz@gmail.com",
      platformBypass: true,
    };

    expect(actorIsSuperAdmin(scope)).toBe(true);
    expect(canDoTask(scope, "task.template.manage")).toBe(true);
    expect(canDoTask(scope, "task.cancel")).toBe(true);
  });

  it("passes platformBypass from workspace actor into task scope", () => {
    const scope = resolveTaskActorScope({
      workspaceRole: "STAFF",
      email: "workspace.moroz@gmail.com",
      profileRole: "staff",
      profileEmail: "workspace.moroz@gmail.com",
      platformBypass: true,
    });

    expect(scope.platformBypass).toBe(true);
    expect(canDoTask(scope, "task.assign")).toBe(true);
  });

  it("preserves owner task access without platformBypass", () => {
    const scope = resolveTaskActorScope({
      workspaceRole: "OWNER",
      email: "owner@example.com",
      profileRole: "OWNER",
      profileEmail: "owner@example.com",
    });

    expect(canDoTask(scope, "task.template.manage")).toBe(true);
  });
});
