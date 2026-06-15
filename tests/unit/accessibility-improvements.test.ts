import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { A11Y_FOCUS_RING, A11Y_INLINE_LINK, A11Y_SEGMENT_BUTTON } from "@/lib/a11y/ui-classes";

const GLOBALS_PATH = join(process.cwd(), "app/globals.css");
const PRICING_PATH = join(process.cwd(), "components/marketing/pricing-page.tsx");
const ROI_PATH = join(process.cwd(), "components/marketing/roi-calculator.tsx");
const LOGIN_FORM_PATH = join(process.cwd(), "components/auth/login-form.tsx");
const LOGIN_PAGE_PATH = join(process.cwd(), "app/login/page.tsx");

describe("accessibility improvements", () => {
  it("exports shared focus and inline-link classes", () => {
    expect(A11Y_FOCUS_RING).toContain("focus-visible:ring-ring");
    expect(A11Y_INLINE_LINK).toContain("underline");
    expect(A11Y_SEGMENT_BUTTON).toContain(A11Y_FOCUS_RING);
  });

  it("darkens muted foreground and adds global focus-visible outlines", () => {
    const css = readFileSync(GLOBALS_PATH, "utf8");
    expect(css).toContain("--muted-foreground: 240 5% 38%;");
    expect(css).toContain(":focus:not(:focus-visible)");
    expect(css).toContain("button:focus-visible");
  });

  it("labels pricing billing toggle and ROI calculator inputs", () => {
    const pricing = readFileSync(PRICING_PATH, "utf8");
    const roi = readFileSync(ROI_PATH, "utf8");
    expect(pricing).toContain('aria-label="Billing period"');
    expect(pricing).toContain("aria-pressed");
    expect(pricing).toContain("A11Y_SEGMENT_BUTTON");
    expect(roi).toContain("htmlFor={id}");
    expect(roi).toContain("RoiField");
  });

  it("uses underlined inline links on auth shell pages", () => {
    const loginForm = readFileSync(LOGIN_FORM_PATH, "utf8");
    const loginPage = readFileSync(LOGIN_PAGE_PATH, "utf8");
    expect(loginForm).toContain("A11Y_INLINE_LINK");
    expect(loginPage).toContain("A11Y_INLINE_LINK");
  });
});
