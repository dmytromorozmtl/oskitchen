import { describe, expect, it } from "vitest";

import { estimateTokens } from "@/lib/ai/budget-guard";

describe("estimateTokens", () => {
  it("uses conservative chars/3 ratio", () => {
    expect(estimateTokens("hello world")).toBe(4);
    expect(estimateTokens("")).toBe(0);
  });
});
