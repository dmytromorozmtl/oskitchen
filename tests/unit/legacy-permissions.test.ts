import { describe, expect, it } from "vitest";

import { hasLegacyPermission, normalizeRole } from "@/lib/permissions/legacy";

describe("legacy permissions", () => {
  it("grants pos_comp to manager", () => {
    expect(hasLegacyPermission(normalizeRole("MANAGER"), "pos_comp")).toBe(true);
  });

  it("denies pos_comp to viewer", () => {
    expect(hasLegacyPermission(normalizeRole("VIEWER"), "pos_comp")).toBe(false);
  });
});
