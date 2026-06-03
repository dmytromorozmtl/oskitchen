import { describe, expect, it } from "vitest";

import { isUuid } from "@/lib/platform/is-uuid";

describe("isUuid", () => {
  it("accepts valid v4 ids", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("rejects malformed cookie values", () => {
    expect(isUuid("")).toBe(false);
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("expired-session-123")).toBe(false);
  });
});
