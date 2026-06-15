import { describe, expect, it } from "vitest";

import { slugifyCollectionSlug, validateCollectionSlugFormat } from "@/lib/menus/collection-slug";
import { markdownLiteToHtml } from "@/lib/storefront/markdown-lite";
import { buildSectionsCreateInput, pageSectionTemplateForType } from "@/lib/storefront/page-section-templates";
import { resolveSectionPack, sectionPackToCreatePayload } from "@/lib/storefront/section-packs";
import { buildBreadcrumbJsonLd } from "@/lib/storefront/seo";
import { evaluateStrictEnvGate } from "@/lib/experiment-production/strict-env-validator";
import { wormholeLatencySloMs } from "@/lib/storefront/theme-experiment-intergalactic-mesh-federation";
import { StorefrontPageType } from "@prisma/client";

/**
 * Phase 6 — merchant storefront smoke: builder, SEO, collections + experiment ops gates.
 */
describe("storefront phase 6 — builder & content", () => {
  it("hero_cta section pack builds two sections", () => {
    const pack = resolveSectionPack("hero_cta");
    expect(pack).toBeTruthy();
    expect(sectionPackToCreatePayload(pack!).length).toBe(2);
  });

  it("thank-you page is noindex with sections", () => {
    const tpl = pageSectionTemplateForType(StorefrontPageType.THANK_YOU);
    expect(tpl.robotsNoindex).toBe(true);
    expect(buildSectionsCreateInput(StorefrontPageType.THANK_YOU).length).toBeGreaterThan(0);
  });

  it("markdown lite renders basic markup", () => {
    const html = markdownLiteToHtml("**bold** and _italic_");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("breadcrumb JSON-LD includes home", () => {
    const ld = buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Menu", path: "/menu" },
    ]);
    expect(JSON.stringify(ld)).toContain("BreadcrumbList");
  });
});

describe("storefront phase 6 — collections", () => {
  it("rejects reserved collection slug menu", () => {
    const r = validateCollectionSlugFormat("menu");
    expect(r.ok).toBe(false);
  });

  it("slugifies specials", () => {
    expect(slugifyCollectionSlug("Chef's Specials!")).toBe("chef-s-specials");
  });
});

describe("storefront phase 6 — experiment ops", () => {
  it("wormhole SLO default is 500ms for load tests", () => {
    delete process.env.THEME_EXPERIMENT_WORMHOLE_LATENCY_SLO_MS;
    expect(wormholeLatencySloMs()).toBe(500);
  });

  it("strict publish gate documents AC dependency", () => {
    process.env.THEME_EXPERIMENT_STRICT_PUBLISH_GATES = "1";
    process.env.THEME_EXPERIMENT_PREFRONTAL_ORGANOID_MESH = "1";
    delete process.env.THEME_EXPERIMENT_HIPPOCAMPAL_ORGANOID_MESH;
    expect(evaluateStrictEnvGate().passed).toBe(false);
    delete process.env.THEME_EXPERIMENT_STRICT_PUBLISH_GATES;
    delete process.env.THEME_EXPERIMENT_PREFRONTAL_ORGANOID_MESH;
  });
});
