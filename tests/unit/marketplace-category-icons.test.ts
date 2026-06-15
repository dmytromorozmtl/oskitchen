import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  HORECA_TOP_LEVEL_CATEGORY_SLUGS,
  getMarketplaceCategoryIconMeta,
  MARKETPLACE_CATEGORY_ICON_META,
  resolveMarketplaceCategoryIconMeta,
} from "@/lib/marketplace/category-icons";
import { HORECA_CATEGORIES } from "../../prisma/seed-marketplace-categories";

const ICON_COMPONENT_PATH = join(process.cwd(), "components/marketplace/marketplace-category-icon.tsx");
const BROWSE_GRID_PATH = join(process.cwd(), "components/marketplace/marketplace-category-browse-grid.tsx");
const SIDEBAR_PATH = join(process.cwd(), "components/marketplace/marketplace-category-sidebar.tsx");

describe("marketplace category icons", () => {
  it("defines icons for all 8 HoReCa top-level categories", () => {
    expect(MARKETPLACE_CATEGORY_ICON_META).toHaveLength(8);
    expect(HORECA_TOP_LEVEL_CATEGORY_SLUGS).toEqual(HORECA_CATEGORIES.map((category) => category.slug));
    expect(MARKETPLACE_CATEGORY_ICON_META.map((meta) => meta.slug)).toEqual([
      ...HORECA_TOP_LEVEL_CATEGORY_SLUGS,
    ]);
  });

  it("resolves child category slugs to parent icon metadata", () => {
    expect(getMarketplaceCategoryIconMeta("packaging-disposables")?.icon).toBe("package");
    expect(resolveMarketplaceCategoryIconMeta("packaging-disposables-cups-and-lids")?.slug).toBe(
      "packaging-disposables",
    );
    expect(resolveMarketplaceCategoryIconMeta("unknown-category")).toBeNull();
  });

  it("ships icon component and browse grid wired into marketplace UI", () => {
    const iconSource = readFileSync(ICON_COMPONENT_PATH, "utf8");
    const gridSource = readFileSync(BROWSE_GRID_PATH, "utf8");
    const sidebarSource = readFileSync(SIDEBAR_PATH, "utf8");

    expect(iconSource).toContain("export function MarketplaceCategoryIcon");
    expect(iconSource).toContain("export function MarketplaceCategoryIconTile");
    expect(gridSource).toContain('data-testid="marketplace-category-browse-grid"');
    expect(gridSource).toContain("MARKETPLACE_CATEGORY_ICON_META");
    expect(sidebarSource).toContain("MarketplaceCategoryIcon");
    expect(sidebarSource).toContain("isHoReCaTopLevelCategorySlug");
  });
});
