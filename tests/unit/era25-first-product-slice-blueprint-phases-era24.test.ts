import { describe, expect, it } from "vitest";

import {
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_PLATFORM_ANCHOR,
  ERA25_FIRST_PRODUCT_SLICE_CANONICAL_NAME,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_PHASES_ERA24_POLICY_ID,
  ERA25_FIRST_PRODUCT_SLICE_BACKLOG_ID,
  ERA25_FIRST_PRODUCT_SLICE_EXISTING_SURFACES,
} from "@/lib/commercial/era25-first-product-slice-blueprint-phases-era24";

describe("era25-first-product-slice-blueprint-phases-era24", () => {
  it("locks phases policy id", () => {
    expect(ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_PHASES_ERA24_POLICY_ID).toBe(
      "era24-era25-first-product-slice-blueprint-phases-v1",
    );
  });

  it("defines canonical slice and platform anchor", () => {
    expect(ERA25_FIRST_PRODUCT_SLICE_CANONICAL_NAME).toBe(
      "owner-daily-briefing-breakthrough",
    );
    expect(ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_PLATFORM_ANCHOR).toBe(
      "#era25-first-product-slice-blueprint",
    );
    expect(ERA25_FIRST_PRODUCT_SLICE_BACKLOG_ID).toBe("KOS-E25-001-ODB-BREAKTHROUGH");
  });

  it("links existing KitchenOS surfaces", () => {
    expect(ERA25_FIRST_PRODUCT_SLICE_EXISTING_SURFACES.length).toBeGreaterThanOrEqual(3);
    expect(
      ERA25_FIRST_PRODUCT_SLICE_EXISTING_SURFACES.some((surface) =>
        surface.path.includes("owner-daily-briefing"),
      ),
    ).toBe(true);
  });

  it("documents blueprint doc path", () => {
    expect(ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC).toContain(
      "next-era25-first-product-slice-blueprint",
    );
  });
});
