import { describe, expect, it } from "vitest";

import { verifyCronSecret, isExperimentalCronsEnabled } from "@/lib/security/cron-auth";
import { coalesceThemeExperimentJson, toInputJsonValue, toJsonValue } from "@/lib/prisma/json";
import { scopedIdWhere, assertResourceBelongsToUserOrWorkspace } from "@/lib/scope/tenant-scope";
import { WorkspaceAccessDeniedError } from "@/lib/scope/assert-user-workspace-access";

describe("lib/prisma/json", () => {
  it("coerces records to JsonValue", () => {
    const v = toJsonValue({ a: 1, b: "x" });
    expect(v).toEqual({ a: 1, b: "x" });
    expect(toInputJsonValue({ nested: { ok: true } })).toEqual({ nested: { ok: true } });
  });

  it("coalesceThemeExperimentJson handles null", () => {
    expect(coalesceThemeExperimentJson(null)).toEqual({});
  });
});

describe("lib/security/cron-auth", () => {
  it("fails closed without CRON_SECRET", () => {
    const prev = process.env.CRON_SECRET;
    delete process.env.CRON_SECRET;
    const req = new Request("http://localhost/api/cron/test");
    const res = verifyCronSecret(req);
    expect(res.ok).toBe(false);
    if (prev) process.env.CRON_SECRET = prev;
  });

  it("experimental crons default off", () => {
    delete process.env.ENABLE_EXPERIMENTAL_CRONS;
    expect(isExperimentalCronsEnabled()).toBe(false);
  });
});

describe("lib/scope/tenant-scope", () => {
  it("scopedIdWhere prefers workspace", () => {
    expect(scopedIdWhere({ userId: "u1", workspaceId: "w1" }, "id-1")).toEqual({
      id: "id-1",
      workspaceId: "w1",
    });
  });

  it("assertResourceBelongsToUserOrWorkspace denies cross-workspace", () => {
    expect(() =>
      assertResourceBelongsToUserOrWorkspace(
        { userId: "u1", workspaceId: "w1" },
        { userId: "u1", workspaceId: "w2" },
      ),
    ).toThrow(WorkspaceAccessDeniedError);
  });

  it("assertResourceBelongsToUserOrWorkspace denies cross-user without workspace", () => {
    expect(() =>
      assertResourceBelongsToUserOrWorkspace(
        { userId: "u1", workspaceId: null },
        { userId: "u2", workspaceId: null },
      ),
    ).toThrow(WorkspaceAccessDeniedError);
  });
});
