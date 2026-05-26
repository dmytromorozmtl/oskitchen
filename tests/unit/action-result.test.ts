import { describe, expect, it } from "vitest";

import { failure, success } from "@/lib/action-result";
import { runSafeAction } from "@/lib/safe-action";

describe("action-result", () => {
  it("success omits data when void", () => {
    expect(success()).toEqual({ ok: true });
  });

  it("success carries data", () => {
    expect(success({ id: "1" })).toEqual({ ok: true, data: { id: "1" } });
  });

  it("failure carries code", () => {
    expect(failure("bad", "VALIDATION")).toEqual({
      ok: false,
      error: "bad",
      code: "VALIDATION",
    });
  });
});

describe("runSafeAction", () => {
  it("returns failure envelope on throw", async () => {
    const r = await runSafeAction(async () => {
      throw new Error("FORBIDDEN");
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("access");
  });
});
