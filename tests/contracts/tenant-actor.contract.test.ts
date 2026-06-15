import { describe, expect, it } from "vitest";
import { z } from "zod";

const tenantActorSchema = z.object({
  userId: z.string().uuid(),
  workspaceId: z.string().uuid().nullable().optional(),
});

describe("requireTenantActor shape", () => {
  it("accepts owner with workspace", () => {
    expect(
      tenantActorSchema.safeParse({
        userId: "00000000-0000-4000-8000-000000000001",
        workspaceId: "00000000-0000-4000-8000-000000000002",
      }).success,
    ).toBe(true);
  });
});
