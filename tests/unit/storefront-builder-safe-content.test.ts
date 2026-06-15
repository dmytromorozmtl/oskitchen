import { describe, expect, it } from "vitest";

import { assertSafeHttpsUrl, sanitizeRichTextLite } from "@/lib/storefront-builder/safe-content";

describe("storefront-builder safe content", () => {
  it("allows https", () => {
    expect(assertSafeHttpsUrl("https://cdn.example.com/a.png").ok).toBe(true);
  });

  it("blocks javascript", () => {
    expect(assertSafeHttpsUrl("javascript:alert(1)").ok).toBe(false);
  });

  it("allows localhost http in dev mode", () => {
    expect(assertSafeHttpsUrl("http://localhost:3000/x.png", { allowHttpLocal: true }).ok).toBe(true);
  });

  it("strips script tags lite", () => {
    expect(sanitizeRichTextLite('<p>Hi</p><script>alert(1)</script>')).not.toContain("script");
  });
});
