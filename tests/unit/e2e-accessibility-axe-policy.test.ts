import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  E2E_ACCESSIBILITY_AXE_CI_SCRIPTS,
  E2E_ACCESSIBILITY_AXE_DASHBOARD_ROUTE_COUNT,
  E2E_ACCESSIBILITY_AXE_DASHBOARD_ROUTES,
  E2E_ACCESSIBILITY_AXE_POLICY_ID,
  E2E_ACCESSIBILITY_AXE_SPEC_PATH,
  E2E_ACCESSIBILITY_AXE_WCAG_TAGS,
  E2E_ACCESSIBILITY_AXE_WORKFLOW_PATH,
  filterSeriousAxeViolations,
  isSeriousOrCriticalAxeImpact,
  summarizeAxeViolations,
} from "@/lib/accessibility/e2e-accessibility-axe-policy";

const ROOT = process.cwd();

describe("E2E accessibility axe policy (Absolute Final Task 46)", () => {
  it("locks 10 key dashboard routes and WCAG 2.1 AA tags", () => {
    expect(E2E_ACCESSIBILITY_AXE_POLICY_ID).toBe("e2e-accessibility-axe-absolute-final-v1");
    expect(E2E_ACCESSIBILITY_AXE_DASHBOARD_ROUTE_COUNT).toBe(10);
    expect(E2E_ACCESSIBILITY_AXE_DASHBOARD_ROUTES[0]).toBe("/dashboard/today");
    expect(E2E_ACCESSIBILITY_AXE_DASHBOARD_ROUTES.at(-1)).toBe("/dashboard/menus");
    expect(E2E_ACCESSIBILITY_AXE_WCAG_TAGS).toEqual([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
    ]);
  });

  it("filters serious and critical axe violations only", () => {
    expect(isSeriousOrCriticalAxeImpact("critical")).toBe(true);
    expect(isSeriousOrCriticalAxeImpact("moderate")).toBe(false);

    const filtered = filterSeriousAxeViolations([
      { id: "color-contrast", impact: "serious" },
      { id: "region", impact: "moderate" },
    ]);
    expect(filtered.map((row) => row.id)).toEqual(["color-contrast"]);

    expect(
      summarizeAxeViolations([
        {
          id: "button-name",
          impact: "critical",
          description: "Buttons must have discernible text",
          nodes: [{ html: "<button></button>" }],
        },
      ]),
    ).toEqual([
      {
        id: "button-name",
        impact: "critical",
        description: "Buttons must have discernible text",
        nodes: 1,
      },
    ]);
  });

  it("ships Playwright spec, npm scripts, and GHA workflow", () => {
    const spec = readFileSync(join(ROOT, E2E_ACCESSIBILITY_AXE_SPEC_PATH), "utf8");
    expect(spec).toContain("E2E_ACCESSIBILITY_AXE_DASHBOARD_ROUTES");
    expect(spec).toContain("analyzeSeriousA11yViolations");

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of E2E_ACCESSIBILITY_AXE_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(pkg.scripts?.["test:e2e:dashboard-a11y"]).toContain(E2E_ACCESSIBILITY_AXE_SPEC_PATH);

    const workflow = readFileSync(join(ROOT, E2E_ACCESSIBILITY_AXE_WORKFLOW_PATH), "utf8");
    expect(workflow).toContain("test:e2e:dashboard-a11y");
    expect(workflow).toContain("10 dashboard pages");
    expect(workflow).toContain("E2E_LOGIN_EMAIL");

    const playwrightConfig = readFileSync(join(ROOT, "playwright.config.ts"), "utf8");
    expect(playwrightConfig).toContain("dashboard-accessibility-axe.spec.ts");
  });
});
