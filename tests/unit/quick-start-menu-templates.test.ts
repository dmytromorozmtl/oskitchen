import { describe, expect, it } from "vitest";

import { MENU_TEMPLATES, getMenuTemplate, listMenuTemplates } from "@/services/onboarding/menu-templates";
import {
  quickStartChannelsToIntents,
  quickStartFinishUrl,
  resolveQuickStartModuleKeys,
} from "@/lib/onboarding/quick-start-channels";

describe("menu-templates", () => {
  it("defines seven restaurant templates with items", () => {
    expect(listMenuTemplates()).toHaveLength(7);
    for (const t of listMenuTemplates()) {
      expect(t.items.length).toBeGreaterThanOrEqual(4);
      expect(t.categories.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("maps full service to RESTAURANT", () => {
    const t = getMenuTemplate("full_service");
    expect(t.businessType).toBe("RESTAURANT");
    expect(MENU_TEMPLATES.full_service.items.some((i) => i.name.includes("Caesar"))).toBe(true);
  });
});

describe("quick-start-channels", () => {
  it("enables POS modules when pos channel selected", () => {
    const keys = resolveQuickStartModuleKeys("RESTAURANT", ["pos"]);
    expect(keys).toContain("pos_terminal");
    expect(keys).toContain("kitchen_screen");
  });

  it("maps channels to storefront intent", () => {
    const intents = quickStartChannelsToIntents(["website"]);
    expect(intents).toContain("storefront");
  });

  it("finishes at POS when pos selected", () => {
    expect(quickStartFinishUrl(["pos"], "WALK_IN_DAILY")).toContain(
      "/dashboard/pos/terminal?welcome=true",
    );
  });
});
