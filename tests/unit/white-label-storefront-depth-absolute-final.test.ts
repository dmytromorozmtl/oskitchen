import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditWhiteLabelStorefrontDepthWiring } from "@/lib/storefront/white-label-storefront-depth-audit";
import {
  computeWhiteLabelDepthReadinessPercent,
  countWhiteLabelDepthByMaturity,
  resolveWhiteLabelCustomDomainConfigured,
  WHITE_LABEL_STOREFRONT_DEPTH_ABSOLUTE_FINAL_POLICY_ID,
  WHITE_LABEL_STOREFRONT_DEPTH_CHOWNOW_PARITY_PILLARS,
  WHITE_LABEL_STOREFRONT_DEPTH_CI_SCRIPTS,
  WHITE_LABEL_STOREFRONT_DEPTH_ROUTE,
  WHITE_LABEL_STOREFRONT_DEPTH_UNIT_TEST,
  type WhiteLabelDepthCapability,
} from "@/lib/storefront/white-label-storefront-depth-absolute-final-policy";
import { WHITE_LABEL_STOREFRONT_DEPTH_BASE_CAPABILITIES } from "@/lib/storefront/white-label-storefront-depth-content";

const ROOT = process.cwd();

describe("White-label storefront depth (Absolute Final Task 95)", () => {
  it("locks absolute final policy and /dashboard/storefront/white-label route", () => {
    expect(WHITE_LABEL_STOREFRONT_DEPTH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "white-label-storefront-depth-absolute-final-v1",
    );
    expect(WHITE_LABEL_STOREFRONT_DEPTH_ROUTE).toBe("/dashboard/storefront/white-label");
    expect(WHITE_LABEL_STOREFRONT_DEPTH_CHOWNOW_PARITY_PILLARS).toHaveLength(5);
    expect(WHITE_LABEL_STOREFRONT_DEPTH_BASE_CAPABILITIES.length).toBeGreaterThanOrEqual(10);
  });

  it("resolves custom domain configured from settings", () => {
    expect(resolveWhiteLabelCustomDomainConfigured("order.example.com", "custom")).toBe(true);
    expect(resolveWhiteLabelCustomDomainConfigured("order.example.com", "path")).toBe(false);
    expect(resolveWhiteLabelCustomDomainConfigured(null, "custom")).toBe(false);
  });

  it("counts maturity bands and computes weighted readiness", () => {
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
        maturity: "SKIPPED",
        detail: "skipped",
        manageHref: "/",
      },
    ];

    const counts = countWhiteLabelDepthByMaturity(capabilities);
    expect(counts.liveCount).toBe(1);
    expect(counts.betaCount).toBe(1);
    expect(counts.skippedCount).toBe(1);
    expect(computeWhiteLabelDepthReadinessPercent(capabilities)).toBe(57);
  });

  it("passes wiring audit", () => {
    const audit = auditWhiteLabelStorefrontDepthWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of WHITE_LABEL_STOREFRONT_DEPTH_CI_SCRIPTS) {
      expect(pkg.scripts?.[script], `missing script ${script}`).toBeTruthy();
    }
    expect(WHITE_LABEL_STOREFRONT_DEPTH_UNIT_TEST).toContain(
      "white-label-storefront-depth-absolute-final.test.ts",
    );
  });
});
