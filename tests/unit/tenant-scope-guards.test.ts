import { describe, expect, it } from "vitest";

import { scopedIdWhere } from "@/lib/scope/tenant-scope";

describe("tenant-scope guards", () => {
  it("scopes by workspace when workspaceId present", () => {
    expect(scopedIdWhere({ userId: "u1", workspaceId: "ws1" }, "row-1")).toEqual({
      id: "row-1",
      workspaceId: "ws1",
    });
  });

  it("falls back to userId when no workspace", () => {
    expect(scopedIdWhere({ userId: "u1", workspaceId: null }, "row-2")).toEqual({
      id: "row-2",
      userId: "u1",
    });
  });
});
