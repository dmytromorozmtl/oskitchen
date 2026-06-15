import { describe, expect, it } from "vitest";

import { validateCustomCss } from "@/lib/storefront/validate-custom-css";

describe("validateCustomCss", () => {
  it("accepts plain rules", () => {
    expect(validateCustomCss(".kos-storefront-root h1 { color: red; }").valid).toBe(true);
  });

  it("rejects script tags", () => {
    const r = validateCustomCss("<script>alert(1)</script>");
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/Script/i);
  });

  it("rejects @import", () => {
    expect(validateCustomCss("@import url('x.css');").valid).toBe(false);
  });
});
