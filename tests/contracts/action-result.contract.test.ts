import { describe, expect, it } from "vitest";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";

const actionResultSchema = z.union([
  z.object({ ok: z.literal(true), data: z.unknown().optional() }),
  z.object({ ok: z.literal(false), error: z.string(), code: z.string().optional() }),
]);

describe("ActionResult contract", () => {
  it("ok() matches schema", () => {
    expect(actionResultSchema.safeParse(ok({ id: "1" })).success).toBe(true);
  });

  it("fail() matches schema", () => {
    expect(actionResultSchema.safeParse(fail("nope", "FORBIDDEN")).success).toBe(true);
  });

  it("rejects legacy success shape", () => {
    expect(actionResultSchema.safeParse({ success: true }).success).toBe(false);
  });
});
