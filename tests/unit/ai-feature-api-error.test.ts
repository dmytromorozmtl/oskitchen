import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { AI_FEATURE_PAGES } from "@/lib/ai/ai-feature-pages";

const ROOT = process.cwd();
const WRAPPER_PATH = join(ROOT, "components/dashboard/ai-feature-api-error.tsx");
const LOADER_PATH = join(ROOT, "lib/ai/load-ai-feature-page.ts");

describe("AI feature ApiErrorState wiring", () => {
  it("exports AiFeatureApiError wrapper with Today + support defaults", () => {
    const source = readFileSync(WRAPPER_PATH, "utf8");
    expect(source).toContain("export function AiFeatureApiError");
    expect(source).toContain("ApiErrorState");
    expect(source).toContain('data-testid={testId}');
    expect(source).toContain('homeHref="/dashboard/today"');
    expect(source).toContain('supportHref="/dashboard/support"');
  });

  it("exports loadAiFeaturePage helper", () => {
    const source = readFileSync(LOADER_PATH, "utf8");
    expect(source).toContain("export async function loadAiFeaturePage");
    expect(source).toContain('ok: false');
  });

  it.each(
    AI_FEATURE_PAGES.filter(
      (page) =>
        page.pageFile !== "app/dashboard/marketing/manager/page.tsx" &&
        page.pageFile !== "app/dashboard/staff/labor-manager/page.tsx",
    ).map((page) => [page.route, page.pageFile] as const),
  )(
    "%s uses shared AI load error handling",
    (_route, pageFile) => {
      const source = readFileSync(join(ROOT, pageFile), "utf8");
      expect(source).toMatch(/AiFeatureApiError|loadAiFeaturePage/);
    },
  );

  it("marketing and labor manager pages load snapshots directly without AiFeatureApiError wrapper", () => {
    for (const pageFile of [
      "app/dashboard/marketing/manager/page.tsx",
      "app/dashboard/staff/labor-manager/page.tsx",
    ]) {
      const source = readFileSync(join(ROOT, pageFile), "utf8");
      expect(source).toMatch(/loadMarketingManagerSnapshot|loadLaborManagerSnapshot/);
    }
  });
});
