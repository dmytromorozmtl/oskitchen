import { describe, expect, it } from "vitest";

import { hasLegacyPermission, normalizeRole } from "@/lib/permissions/legacy";

describe("pos void permissions", () => {
  it("manager can void", () => {
    expect(hasLegacyPermission(normalizeRole("MANAGER"), "pos_comp")).toBe(true);
  });

  it("kitchen staff cannot void", () => {
    expect(hasLegacyPermission(normalizeRole("KITCHEN_STAFF"), "pos_comp")).toBe(false);
  });
});
