import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  whereOrdersForOwnerAnd,
  whereOrdersInWindow,
  whereOrdersInWindowForOwner,
} from "@/lib/analytics/revenue-metrics";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(),
}));

import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

describe("revenue-metrics workspace scope", () => {
  beforeEach(() => {
    vi.mocked(resolveOwnerWorkspaceId).mockReset();
  });

  it("whereOrdersInWindow scopes by workspaceId when provided", () => {
    const from = new Date("2026-01-01");
    const to = new Date("2026-01-31");
    expect(
      whereOrdersInWindow({ userId: "owner-1", workspaceId: "ws-1", from, to }),
    ).toEqual({
      AND: [{ workspaceId: "ws-1" }, { createdAt: { gte: from, lte: to } }],
    });
  });

  it("whereOrdersInWindowForOwner resolves workspace", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-9");
    const from = new Date("2026-02-01");
    const to = new Date("2026-02-28");
    await expect(
      whereOrdersInWindowForOwner({ userId: "owner-1", from, to, extra: { status: "CONFIRMED" } }),
    ).resolves.toEqual({
      AND: [
        { workspaceId: "ws-9" },
        { createdAt: { gte: from, lte: to } },
        { status: "CONFIRMED" },
      ],
    });
  });

  it("whereOrdersForOwnerAnd merges extra filters", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue(null);
    await expect(
      whereOrdersForOwnerAnd("owner-1", { customerEmail: { equals: "a@b.co", mode: "insensitive" } }),
    ).resolves.toEqual({
      AND: [{ userId: "owner-1" }, { customerEmail: { equals: "a@b.co", mode: "insensitive" } }],
    });
  });
});
