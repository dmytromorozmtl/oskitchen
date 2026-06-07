import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditQaFullCoverageSlot } from "@/lib/qa/absolute-final-qa-full-coverage-audit";
import {
  getQaFullCoverageSlot,
  QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/qa/absolute-final-qa-full-coverage-policy";
import { auditWhiteLabelStorefrontDepthWiring } from "@/lib/storefront/white-label-storefront-depth-audit";
import {
  computeWhiteLabelDepthReadinessPercent,
  countWhiteLabelDepthByMaturity,
  resolveWhiteLabelCustomDomainConfigured,
  WHITE_LABEL_STOREFRONT_DEPTH_ABSOLUTE_FINAL_POLICY_ID,
  WHITE_LABEL_STOREFRONT_DEPTH_CHOWNOW_PARITY_PILLARS,
  WHITE_LABEL_STOREFRONT_DEPTH_HONESTY_MARKERS,
  WHITE_LABEL_STOREFRONT_DEPTH_ROUTE,
  type WhiteLabelDepthCapability,
} from "@/lib/storefront/white-label-storefront-depth-absolute-final-policy";
import { WHITE_LABEL_STOREFRONT_DEPTH_BASE_CAPABILITIES } from "@/lib/storefront/white-label-storefront-depth-content";

const ROOT = process.cwd();
/** Absolute Final Task 110 — QA full coverage for feature 95 white-label storefront depth */
const TASK = 110;
const FEATURE = 95;

describe(`QA full coverage — white-label storefront depth (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks QA registry slot 110 → feature 95 ChowNow white-label storefront depth", () => {
    expect(QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-qa-full-coverage-v1");
    const slot = getQaFullCoverageSlot(TASK);
    expect(slot?.featureKey).toBe("white-label-storefront-depth");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.baseCertTest).toBe(
      "tests/unit/white-label-storefront-depth-absolute-final.test.ts",
    );
    expect(WHITE_LABEL_STOREFRONT_DEPTH_CHOWNOW_PARITY_PILLARS).toHaveLength(5);
    expect(WHITE_LABEL_STOREFRONT_DEPTH_ROUTE).toBe("/dashboard/storefront/white-label");
    expect(WHITE_LABEL_STOREFRONT_DEPTH_BASE_CAPABILITIES.length).toBe(11);
  });

  it("resolves custom domain configured from hostname and primary domain mode", () => {
    expect(resolveWhiteLabelCustomDomainConfigured("order.example.com", "custom")).toBe(true);
    expect(resolveWhiteLabelCustomDomainConfigured("order.example.com", "CUSTOM")).toBe(true);
    expect(resolveWhiteLabelCustomDomainConfigured("order.example.com", "path")).toBe(false);
    expect(resolveWhiteLabelCustomDomainConfigured("  ", "custom")).toBe(false);
    expect(resolveWhiteLabelCustomDomainConfigured(null, "custom")).toBe(false);
  });

  it("counts maturity bands and computes weighted readiness including ROADMAP", () => {
    const capabilities: WhiteLabelDepthCapability[] = [
      {
        id: "a",
        pillar: "branded_theme_tokens",
        label: "A",
        chowNowLabel: "A",
        maturity: "LIVE",
        detail: "live",
        manageHref: "/",
      },
      {
        id: "b",
        pillar: "custom_domain_routing",
        label: "B",
        chowNowLabel: "B",
        maturity: "BETA",
        detail: "beta",
        manageHref: "/",
      },
      {
        id: "c",
        pillar: "branded_pwa_install",
        label: "C",
        chowNowLabel: "C",
        maturity: "ROADMAP",
        detail: "roadmap",
        manageHref: "/",
      },
      {
        id: "d",
        pillar: "catering_group_pages",
        label: "D",
        chowNowLabel: "D",
        maturity: "SKIPPED",
        detail: "skipped",
        manageHref: "/",
      },
    ];

    const counts = countWhiteLabelDepthByMaturity(capabilities);
    expect(counts).toMatchObject({
      liveCount: 1,
      betaCount: 1,
      roadmapCount: 1,
      skippedCount: 1,
    });
    expect(computeWhiteLabelDepthReadinessPercent(capabilities)).toBe(48);
    expect(computeWhiteLabelDepthReadinessPercent([])).toBe(0);
  });

  it("maps base capabilities to all five ChowNow parity pillars", () => {
    for (const pillar of WHITE_LABEL_STOREFRONT_DEPTH_CHOWNOW_PARITY_PILLARS) {
      const items = WHITE_LABEL_STOREFRONT_DEPTH_BASE_CAPABILITIES.filter(
        (cap) => cap.pillar === pillar,
      );
      expect(items.length).toBeGreaterThan(0);
    }
    expect(
      new Set(WHITE_LABEL_STOREFRONT_DEPTH_BASE_CAPABILITIES.map((cap) => cap.id)).size,
    ).toBe(WHITE_LABEL_STOREFRONT_DEPTH_BASE_CAPABILITIES.length);
  });

  it("documents honesty markers — BETA, SKIPPED, ChowNow parity, DNS honesty", () => {
    const panel = readFileSync(
      join(ROOT, "components/dashboard/storefront/white-label-storefront-depth-panel.tsx"),
      "utf8",
    );
    const page = readFileSync(
      join(ROOT, "app/dashboard/storefront/white-label/page.tsx"),
      "utf8",
    );
    const combined = `${panel}\n${page}`;

    for (const marker of WHITE_LABEL_STOREFRONT_DEPTH_HONESTY_MARKERS) {
      expect(
        combined.includes(marker) || combined.toLowerCase().includes(marker.toLowerCase()),
      ).toBe(true);
    }
  });

  it("wires depth UI — readiness cards, pillar grid, capability rows, dark mode", () => {
    const panel = readFileSync(
      join(ROOT, "components/dashboard/storefront/white-label-storefront-depth-panel.tsx"),
      "utf8",
    );

    expect(panel).toContain('data-testid="white-label-storefront-depth-panel"');
    expect(panel).toContain('data-testid="white-label-depth-pillar"');
    expect(panel).toContain('data-testid="white-label-depth-capability"');
    expect(panel).toContain("readinessPercent");
    expect(panel).toContain("ChowNow parity:");
    expect(panel).toContain("dark:text-emerald-400");
    expect(panel).toContain("WHITE_LABEL_STOREFRONT_DEPTH_CHOWNOW_PARITY_PILLARS");
  });

  it("wires depth page, strip, theme page, and service overlay", () => {
    const page = readFileSync(
      join(ROOT, "app/dashboard/storefront/white-label/page.tsx"),
      "utf8",
    );
    const strip = readFileSync(
      join(ROOT, "components/dashboard/storefront/white-label-storefront-depth-strip.tsx"),
      "utf8",
    );
    const themePage = readFileSync(
      join(ROOT, "app/dashboard/storefront/theme/page.tsx"),
      "utf8",
    );
    const service = readFileSync(
      join(ROOT, "services/storefront/white-label-storefront-depth-service.ts"),
      "utf8",
    );

    expect(page).toContain("WhiteLabelStorefrontDepthPanel");
    expect(page).toContain("loadWhiteLabelStorefrontDepthModel");
    expect(page).toContain("storefront.settings");
    expect(strip).toContain("white-label-storefront-depth-strip");
    expect(strip).toContain("WHITE_LABEL_STOREFRONT_DEPTH_ROUTE");
    expect(themePage).toContain("WhiteLabelStorefrontDepthStrip");
    expect(service).toContain("resolveCapabilityMaturity");
    expect(service).toContain("generateBrandedPWA");
    expect(service).toContain("WHITE_LABEL_STOREFRONT_DEPTH_BASE_CAPABILITIES");
  });

  it("passes base wiring audit and QA slot 110 audit gate", () => {
    const wiring = auditWhiteLabelStorefrontDepthWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);

    const qa = auditQaFullCoverageSlot(TASK, ROOT);
    expect(qa.ok, qa.failures.join("; ")).toBe(true);
    expect(qa.slot?.qaTest).toBe(
      "tests/unit/absolute-final-qa-full-coverage-10-white-label.test.ts",
    );
    expect(WHITE_LABEL_STOREFRONT_DEPTH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "white-label-storefront-depth-absolute-final-v1",
    );
  });
});
