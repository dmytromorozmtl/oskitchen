import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AiHonestyBanner } from "@/components/ui/ai-honesty-label";
import {
  AI_HONESTY_LABELS,
  AI_HONESTY_POLICY_ID,
  getAiHonestyLabel,
  getAiHonestyLabelForRoute,
  listAiHonestyModuleIds,
} from "@/lib/ai/ai-honesty-labels";

const ROOT = process.cwd();

const CORE_SEVEN = [
  "restaurant-brain",
  "digital-twin",
  "universal-menu",
  "food-cost-ai",
  "ai-purchasing",
  "kitchen-camera",
  "benchmark-network",
] as const;

describe("ai honesty labels registry", () => {
  it("defines all seven policy modules plus copilot surfaces", () => {
    expect(AI_HONESTY_POLICY_ID).toBe("ai-honesty-policy-v1");
    expect(AI_HONESTY_LABELS.length).toBeGreaterThanOrEqual(7);
    for (const id of CORE_SEVEN) {
      expect(listAiHonestyModuleIds()).toContain(id);
    }
  });

  it("maps primary routes to module labels", () => {
    expect(getAiHonestyLabelForRoute("/dashboard/analytics/digital-twin")?.moduleId).toBe(
      "digital-twin",
    );
    expect(getAiHonestyLabelForRoute("/dashboard/today")?.moduleId).toBe("restaurant-brain");
    expect(getAiHonestyLabelForRoute("/dashboard/copilot/chat")?.moduleId).toBe(
      "operations-copilot",
    );
    expect(getAiHonestyLabelForRoute("/dashboard/orders")).toBeNull();
  });

  it("aligns food cost and purchasing with pilot_ready / beta maturity", () => {
    expect(getAiHonestyLabel("food-cost-ai").maturity).toBe("pilot_ready");
    expect(getAiHonestyLabel("ai-purchasing").maturity).toBe("beta");
    expect(getAiHonestyLabel("kitchen-camera").method).toBe("synthetic_default");
  });

  it("renders maturity + policy attributes in banner", () => {
    const html = renderToStaticMarkup(
      createElement(AiHonestyBanner, { moduleId: "food-cost-ai" }),
    );
    expect(html).toContain('data-testid="ai-honesty-label-food-cost-ai"');
    expect(html).toContain(AI_HONESTY_POLICY_ID);
    expect(html).toContain("Deterministic");
    expect(html).toContain("Pilot ready");
  });

  it("wires AiHonestyBanner into AI module dashboards", () => {
    const paths = [
      "components/dashboard/digital-twin-dashboard.tsx",
      "components/dashboard/food-cost-dashboard.tsx",
      "components/dashboard/purchasing-ai-dashboard.tsx",
      "components/dashboard/universal-menu-dashboard.tsx",
      "components/dashboard/benchmark-dashboard.tsx",
      "components/dashboard/kitchen-cameras-dashboard.tsx",
      "components/dashboard/ai-briefing-panel.tsx",
      "app/dashboard/copilot/page.tsx",
      "app/dashboard/ai/co-pilot/page.tsx",
    ];
    for (const rel of paths) {
      const source = readFileSync(join(ROOT, rel), "utf8");
      expect(source).toContain("AiHonestyBanner");
    }
  });

  it("links to public trust page from banner", () => {
    const html = renderToStaticMarkup(
      createElement(AiHonestyBanner, { moduleId: "restaurant-brain", compact: true }),
    );
    expect(html).toContain('href="/trust"');
  });
});
