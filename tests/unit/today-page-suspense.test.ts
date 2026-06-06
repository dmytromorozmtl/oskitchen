import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { TodaySkeleton } from "@/components/dashboard/today-skeleton";

const ROOT = process.cwd();

describe("today page Suspense skeleton (P0 task 5)", () => {
  it("exports TodaySkeleton with section test ids", () => {
    expect(TodaySkeleton).toBeTypeOf("function");
    const source = readFileSync(join(ROOT, "components/dashboard/today-skeleton.tsx"), "utf8");
    expect(source).toContain("LoadingSkeleton");
    expect(source).toContain("data-testid=\"today-skeleton");
  });

  it("wraps async Today sections in Suspense on the page", () => {
    const page = readFileSync(join(ROOT, "app/dashboard/today/page.tsx"), "utf8");
    expect(page).toContain("Suspense");
    expect(page).toContain("TodaySkeleton");
    expect(page).toContain("OwnerDailyBriefingHeroSection");
    expect(page).toContain("LaunchWizardTodayStripSection");
    expect(page).toContain("PlaybookTodayStrip");
  });
});
