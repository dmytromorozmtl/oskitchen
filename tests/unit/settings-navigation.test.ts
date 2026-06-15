import { describe, expect, it } from "vitest";

import {
  filterVisibleSettingsSections,
  resolveVisibleSettingsShortcuts,
} from "@/lib/settings/settings-navigation";

describe("settings navigation helpers", () => {
  it("returns only viewable sections for staff-level settings access", () => {
    const sections = filterVisibleSettingsSections(["view_settings"], "");

    expect(sections.map((section) => section.key)).toEqual([
      "overview",
      "profile",
      "referrals",
      "voice",
      "hardware",
    ]);
  });

  it("filters query results within the capability-allowed section set", () => {
    const sections = filterVisibleSettingsSections(
      ["view_settings", "manage_operations", "manage_orders", "manage_notifications"],
      "billing",
    );

    expect(sections).toEqual([]);
  });

  it("retains allowed sections when query matches their labels or keywords", () => {
    const sections = filterVisibleSettingsSections(
      ["view_settings", "manage_notifications"],
      "alerts",
    );

    expect(sections.map((section) => section.key)).toEqual(["notifications"]);
  });

  it("does not resurrect hidden pinned or recent sections from stale storage keys", () => {
    const visible = filterVisibleSettingsSections(
      ["view_settings", "manage_operations", "manage_orders"],
      "",
    );

    const shortcuts = resolveVisibleSettingsShortcuts(["billing", "orders", "developer"], visible);

    expect(shortcuts.map((section) => section.key)).toEqual(["orders"]);
  });
});
