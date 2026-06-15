import { describe, expect, it } from "vitest";

import { safeInternalNextPath } from "@/lib/auth/safe-redirect";

describe("safeInternalNextPath", () => {
  it("returns fallback for null/undefined/empty", () => {
    expect(safeInternalNextPath(null)).toBe("/dashboard/today");
    expect(safeInternalNextPath(undefined)).toBe("/dashboard/today");
    expect(safeInternalNextPath("")).toBe("/dashboard/today");
  });

  it("allows internal paths", () => {
    expect(safeInternalNextPath("/dashboard/billing")).toBe("/dashboard/billing");
    expect(safeInternalNextPath("/demo")).toBe("/demo");
    expect(safeInternalNextPath("/s/test-store/menu")).toBe("/s/test-store/menu");
  });

  it("rejects external URLs", () => {
    expect(safeInternalNextPath("https://evil.com")).toBe("/dashboard/today");
    expect(safeInternalNextPath("//evil.com")).toBe("/dashboard/today");
  });

  it("allows same-origin absolute URLs", () => {
    expect(safeInternalNextPath("https://os-kitchen.com/dashboard")).toBe("/dashboard");
    expect(safeInternalNextPath("https://www.os-kitchen.com/pricing")).toBe("/pricing");
  });

  it("rejects path traversal attempts", () => {
    expect(safeInternalNextPath("/\\evil.com")).toBe("/dashboard/today");
    expect(safeInternalNextPath("/@evil.com")).toBe("/dashboard/today");
  });
});
