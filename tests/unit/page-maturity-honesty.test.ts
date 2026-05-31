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

  it("skips duplicate banner when page already has inline honesty copy", () => {
    expect(getPageMaturityHonesty("/dashboard/integrations/doordash")).toBeNull();
    expect(getPageMaturityHonesty("/dashboard/integrations/grubhub")).toBeNull();
  });

  it("returns preview honesty for era14 gap-closure nav routes", () => {
    const payroll = getPageMaturityHonesty("/dashboard/staff/payroll");
    expect(payroll?.exposure).toBe("preview");
    expect(payroll?.detail).toMatch(/payroll/i);

    const campaigns = getPageMaturityHonesty("/dashboard/marketing/email-campaigns");
    expect(campaigns?.exposure).toBe("preview");
    expect(campaigns?.detail).toMatch(/marketing|klaviyo/i);
  });

  it("returns preview honesty for era17 classified routes", () => {
    const theft = getPageMaturityHonesty("/dashboard/costing/theft");
    expect(theft?.exposure).toBe("preview");
    expect(theft?.detail).toMatch(/theft|variance/i);

    const holiday = getPageMaturityHonesty("/dashboard/marketing/holiday-packages");
    expect(holiday?.exposure).toBe("preview");
  });

  it("skips duplicate banner when page has inline honesty copy", () => {
    expect(getPageMaturityHonesty("/dashboard/settings/security/sso")).toBeNull();
    expect(getPageMaturityHonesty("/dashboard/inventory/pos-impacts")).toBeNull();
  });

  it("returns null for default production routes", () => {
    expect(getPageMaturityHonesty("/dashboard/orders")).toBeNull();
    expect(getPageMaturityHonesty("/dashboard/kitchen")).toBeNull();
  });
});
