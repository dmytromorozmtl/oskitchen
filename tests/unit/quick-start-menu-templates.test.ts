import { describe, expect, it } from "vitest";

import { ONBOARDING_MENU_TEMPLATE_IDS } from "@/lib/onboarding/quick-start-types";
import { MENU_TEMPLATES, getMenuTemplate, listMenuTemplates } from "@/services/onboarding/menu-templates";
import {
  quickStartChannelsToIntents,
  quickStartFinishUrl,
  resolveQuickStartModuleKeys,
} from "@/lib/onboarding/quick-start-channels";

const EXPECTED_ITEM_COUNTS: Record<string, number> = {
  full_service: 15,
  qsr: 10,
  bakery: 10,
  bar: 12,
  ghost_kitchen: 8,
  catering: 6,
  food_truck: 8,
  pizza: 8,
  sushi: 12,
  coffee_shop: 10,
};

describe("menu-templates", () => {
  it("defines ten cuisine templates with target item counts", () => {
    expect(listMenuTemplates()).toHaveLength(10);
    expect(ONBOARDING_MENU_TEMPLATE_IDS).toHaveLength(10);
    for (const t of listMenuTemplates()) {
      expect(t.items.length).toBe(EXPECTED_ITEM_COUNTS[t.id]);
      expect(t.categories.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("maps full service to RESTAURANT", () => {
    const t = getMenuTemplate("full_service");
    expect(t.businessType).toBe("RESTAURANT");
    expect(MENU_TEMPLATES.full_service.items.some((i) => i.name.includes("Caesar"))).toBe(true);
  });

  it("includes pizza sushi and coffee shop templates", () => {
    expect(getMenuTemplate("pizza").items).toHaveLength(8);
    expect(getMenuTemplate("sushi").items.some((i) => i.name.includes("roll"))).toBe(true);
    expect(getMenuTemplate("coffee_shop").items.some((i) => i.name.includes("Latte"))).toBe(true);
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
