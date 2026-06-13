import { expect, test } from "@playwright/test";

import {
  BUTTON_REGRESSION_P3_52_CRITICAL_PAGE_COUNT,
  BUTTON_REGRESSION_P3_52_CRITICAL_PAGES,
  BUTTON_REGRESSION_P3_52_FLOW_STEPS,
  BUTTON_REGRESSION_P3_52_POLICY_ID,
  buttonRegressionCriticalPageIds,
} from "@/lib/qa/button-regression-p3-52-policy";
import {
  BUTTON_REGRESSION_P3_52_SHELL_BUTTONS,
  buildButtonRegressionPageProbes,
  countButtonRegressionProbes,
  validateButtonRegressionContract,
} from "@/lib/qa/button-regression-p3-52-measurement";

import {
  runButtonRegressionContractStep,
  runButtonRegressionFlow,
} from "./helpers/button-regression-p3-52-flow";
import {
  skipButtonRegressionP3_52IfGateDisabled,
  skipButtonRegressionP3_52IfNotAuthed,
} from "./helpers/button-regression-p3-52-ready";

/**
 * 30 critical pages button-by-button regression suite.
 *
 * Unit contract: 30 pilot-critical dashboard routes × shell + page-specific probes.
 * E2E smoke: chromium-authed owner visits each page and probes primary buttons.
 *
 * @see docs/button-regression-p3-52.md
 */

test.describe("button regression p3-52 policy", () => {
  test("exports thirty critical pages with shell button probes", () => {
    expect(BUTTON_REGRESSION_P3_52_POLICY_ID).toBe("button-regression-p3-52-v1");
    expect(buttonRegressionCriticalPageIds()).toHaveLength(BUTTON_REGRESSION_P3_52_CRITICAL_PAGE_COUNT);
    expect(BUTTON_REGRESSION_P3_52_CRITICAL_PAGES).toHaveLength(30);
    expect(BUTTON_REGRESSION_P3_52_SHELL_BUTTONS).toHaveLength(3);
    expect(countButtonRegressionProbes()).toBeGreaterThanOrEqual(90);
    expect(validateButtonRegressionContract().passed).toBe(true);
  });

  test("includes POS, kitchen, marketplace, and enterprise routes", () => {
    const paths = BUTTON_REGRESSION_P3_52_CRITICAL_PAGES.map((page) => page.path);
    expect(paths).toContain("/dashboard/pos/terminal");
    expect(paths).toContain("/dashboard/kitchen");
    expect(paths).toContain("/dashboard/marketplace/catalog");
    expect(paths).toContain("/dashboard/enterprise/multi-location");
    expect(paths).toContain("/dashboard/ai/co-pilot");
  });

  test("each page has at least three button probes", () => {
    for (const page of buildButtonRegressionPageProbes()) {
      expect(page.buttons.length).toBeGreaterThanOrEqual(3);
    }
  });
});

test.describe("button regression contract step", () => {
  test("validates thirty-page button regression contract", () => {
    const result = runButtonRegressionContractStep();
    expect(result.contractValid).toBe(true);
    expect(result.pageCount).toBe(30);
    expect(result.probeCount).toBeGreaterThanOrEqual(90);
  });
});

test.describe("button regression authed smoke (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Button regression smoke runs in chromium-authed project only",
    );
    skipButtonRegressionP3_52IfGateDisabled();
    skipButtonRegressionP3_52IfNotAuthed();
  });

  test("owner visits 30 critical pages and probes primary buttons", async ({ page }) => {
    const result = await runButtonRegressionFlow(page);
    if (result.pagesVisited === 0 && result.steps.length === 1) {
      test.skip(true, "Button regression smoke unavailable — auth required.");
    }

    expect(result.contractValid).toBe(true);
    expect(result.steps).toContain("authed_page_button_smoke");
    expect(result.pagesVisited).toBe(30);
    expect(result.buttonsProbed).toBeGreaterThanOrEqual(90);
    expect(result.steps.slice(0, 2)).toEqual([
      BUTTON_REGRESSION_P3_52_FLOW_STEPS[0],
      BUTTON_REGRESSION_P3_52_FLOW_STEPS[1],
    ]);
  });
});
