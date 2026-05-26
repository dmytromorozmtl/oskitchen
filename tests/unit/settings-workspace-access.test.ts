import { describe, expect, it } from "vitest";

import { canAccessSettingsSection } from "@/lib/settings/settings-access";

describe("settings workspace RBAC bridge", () => {
  it("allows owner legacy and workspace.settings", () => {
    const actor = { userId: "u1", email: "o@x.com", role: "OWNER" };
    expect(canAccessSettingsSection(actor, "manage_workspace")).toBe(true);
    expect(canAccessSettingsSection(actor, "manage_orders")).toBe(true);
  });

  it("denies staff manage_workspace via workspace matrix", () => {
    const actor = { userId: "u1", email: "s@x.com", role: "STAFF" };
    expect(canAccessSettingsSection(actor, "manage_workspace")).toBe(false);
    expect(canAccessSettingsSection(actor, "manage_orders")).toBe(true);
  });
});
