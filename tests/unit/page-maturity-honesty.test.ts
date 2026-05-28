import { describe, expect, it } from "vitest";

import { getPageMaturityHonesty } from "@/lib/navigation/page-maturity-honesty";

describe("page maturity honesty", () => {
  it("returns preview honesty for POS preview surfaces", () => {
    const handheld = getPageMaturityHonesty("/dashboard/pos/handheld");
    expect(handheld?.exposure).toBe("preview");
    expect(handheld?.detail).toMatch(/preview/i);

    const tables = getPageMaturityHonesty("/dashboard/tables");
    expect(tables?.exposure).toBe("preview");
    expect(tables?.detail).toMatch(/table-service/i);
  });

  it("returns placeholder honesty for uber-eats integration page", () => {
    const uber = getPageMaturityHonesty("/dashboard/integrations/uber-eats");
    expect(uber?.exposure).toBe("placeholder");
    expect(uber?.detail).toMatch(/placeholder/i);
  });

  it("skips duplicate banner when page already has inline PlaceholderBanner", () => {
    expect(getPageMaturityHonesty("/dashboard/integrations/doordash")).toBeNull();
    expect(getPageMaturityHonesty("/dashboard/integrations/grubhub")).toBeNull();
  });

  it("returns null for default production routes", () => {
    expect(getPageMaturityHonesty("/dashboard/orders")).toBeNull();
    expect(getPageMaturityHonesty("/dashboard/kitchen")).toBeNull();
  });
});
