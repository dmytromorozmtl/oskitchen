import { describe, expect, it } from "vitest";

import { productUpsertSchema } from "@/lib/schemas";

describe("product image URL (menu item / Product.image)", () => {
  const base = {
    title: "Test bowl",
    price: 12.5,
    preparedDate: new Date("2026-05-01"),
  };

  it("accepts HTTPS asset URLs", () => {
    const parsed = productUpsertSchema.safeParse({
      ...base,
      image: "https://cdn.example.com/items/bowl.jpg",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.image).toBe("https://cdn.example.com/items/bowl.jpg");
  });

  it("normalizes empty to null", () => {
    const parsed = productUpsertSchema.safeParse({ ...base, image: "   " });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.image).toBeNull();
  });

  it("rejects non-http schemes", () => {
    const parsed = productUpsertSchema.safeParse({ ...base, image: "ftp://bad.example/x" });
    expect(parsed.success).toBe(false);
  });
});
