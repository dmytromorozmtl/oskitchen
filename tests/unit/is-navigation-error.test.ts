import { describe, expect, it } from "vitest";

import { isNextNavigationError } from "@/lib/next/is-navigation-error";

describe("isNextNavigationError", () => {
  it("detects NEXT_REDIRECT digest", () => {
    expect(isNextNavigationError({ digest: "NEXT_REDIRECT;replace;/onboarding" })).toBe(true);
  });

  it("detects NEXT_NOT_FOUND digest", () => {
    expect(isNextNavigationError({ digest: "NEXT_NOT_FOUND" })).toBe(true);
  });

  it("ignores ordinary errors", () => {
    expect(isNextNavigationError(new Error("db down"))).toBe(false);
    expect(isNextNavigationError(null)).toBe(false);
  });
});
