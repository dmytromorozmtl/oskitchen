import { describe, expect, it } from "vitest";

import {
  childCategorySlug,
  HORECA_CATEGORIES,
  slugifyCategoryName,
} from "../../prisma/seed-marketplace-categories";

describe("marketplace category seed data", () => {
  it("defines 8 top-level HoReCa categories", () => {
    expect(HORECA_CATEGORIES).toHaveLength(8);
    expect(HORECA_CATEGORIES.map((category) => category.slug)).toEqual([
      "packaging-disposables",
      "cleaning-sanitation",
      "kitchenware-tools",
      "equipment",
      "dry-goods",
      "services",
      "uniforms",
      "training",
    ]);
  });

  it("includes child categories for every parent", () => {
    for (const category of HORECA_CATEGORIES) {
      expect(category.children.length).toBeGreaterThan(0);
    }

    const childTotal = HORECA_CATEGORIES.reduce(
      (sum, category) => sum + category.children.length,
      0,
    );
    expect(childTotal).toBeGreaterThanOrEqual(40);
  });

  it("generates unique child slugs under each parent", () => {
    const allSlugs = new Set<string>();

    for (const category of HORECA_CATEGORIES) {
      allSlugs.add(category.slug);

      const childSlugs = category.children.map((child) =>
        childCategorySlug(category.slug, child),
      );
      expect(new Set(childSlugs).size).toBe(childSlugs.length);

      for (const slug of childSlugs) {
        expect(allSlugs.has(slug)).toBe(false);
        allSlugs.add(slug);
      }
    }
  });

  it("slugifies names consistently", () => {
    expect(slugifyCategoryName("Cups & Lids")).toBe("cups-and-lids");
    expect(childCategorySlug("packaging-disposables", "Cups & Lids")).toBe(
      "packaging-disposables-cups-and-lids",
    );
  });
});
