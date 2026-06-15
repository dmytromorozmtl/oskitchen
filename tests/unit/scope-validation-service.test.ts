import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { userOwnsWorkspace } from "@/services/scope/scope-validation-service";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    workspace: {
      findFirst: vi.fn().mockResolvedValue({ id: "ws-1" }),
    },
  },
}));

describe("scope-validation-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns true when prisma finds workspace", async () => {
    const ok = await userOwnsWorkspace("user-1", "ws-1");
    expect(ok).toBe(true);
  });
});
