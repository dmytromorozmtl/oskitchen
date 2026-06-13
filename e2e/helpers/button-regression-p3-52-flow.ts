import { expect, type Page } from "@playwright/test";

import type { ButtonRegressionButtonProbe } from "@/lib/qa/button-regression-p3-52-measurement";
import {
  buildButtonRegressionPageProbes,
  validateButtonRegressionContract,
} from "@/lib/qa/button-regression-p3-52-measurement";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./dashboard-smoke";

export type ButtonProbeResult = {
  buttonId: string;
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

export type PageButtonProbeResult = {
  pageId: string;
  path: string;
  probes: ButtonProbeResult[];
  missingRequired: string[];
};

export type ButtonRegressionFlowResult = {
  steps: string[];
  contractValid: boolean;
  pagesVisited: number;
  buttonsProbed: number;
  buttonsClicked: number;
  pageResults: PageButtonProbeResult[];
};

export function runButtonRegressionContractStep(): {
  contractValid: boolean;
  pageCount: number;
  probeCount: number;
} {
  const result = validateButtonRegressionContract();
  expect(result.errors, "Button regression contract should be valid").toEqual([]);
  return {
    contractValid: result.passed,
    pageCount: result.pageCount,
    probeCount: result.probeCount,
  };
}

async function dismissOverlayAfterClick(page: Page, buttonId: string): Promise<void> {
  if (buttonId === "nav_menu" || buttonId === "account_menu") {
    await page.keyboard.press("Escape").catch(() => undefined);
  }
}

export async function probePageButtons(
  page: Page,
  path: string,
  pageId: string,
  buttons: readonly ButtonRegressionButtonProbe[],
): Promise<PageButtonProbeResult | null> {
  await page.goto(path);

  if (page.url().includes("/login")) {
    return null;
  }

  await assertNoDashboardRscFailure(page);

  const probes: ButtonProbeResult[] = [];
  const missingRequired: string[] = [];

  for (const button of buttons) {
    const locator = page.getByRole("button", {
      name: new RegExp(button.namePattern, "i"),
    });
    const count = await locator.count();

    if (count === 0) {
      if (button.optional) {
        probes.push({ buttonId: button.id, ok: true, skipped: true });
        continue;
      }
      missingRequired.push(button.id);
      probes.push({ buttonId: button.id, ok: false, error: "not found" });
      continue;
    }

    const target = locator.first();
    try {
      await expect(target).toBeVisible();
      await expect(target).toBeEnabled();

      if (button.clickSafe) {
        await target.click();
        await assertNoDashboardRscFailure(page);
        await dismissOverlayAfterClick(page, button.id);
      }

      probes.push({ buttonId: button.id, ok: true });
    } catch (error) {
      if (button.optional) {
        probes.push({ buttonId: button.id, ok: true, skipped: true });
        continue;
      }
      missingRequired.push(button.id);
      probes.push({
        buttonId: button.id,
        ok: false,
        error: error instanceof Error ? error.message : "probe failed",
      });
    }
  }

  return { pageId, path, probes, missingRequired };
}

export async function runButtonRegressionAuthedSmokeStep(
  page: Page,
): Promise<Omit<ButtonRegressionFlowResult, "steps" | "contractValid"> | null> {
  await skipIfLoginRedirect(page, "Button regression P3-52 requires dashboard auth");

  const pageProbes = buildButtonRegressionPageProbes();
  const pageResults: PageButtonProbeResult[] = [];
  let pagesVisited = 0;
  let buttonsProbed = 0;
  let buttonsClicked = 0;

  for (const pageProbe of pageProbes) {
    const result = await probePageButtons(
      page,
      pageProbe.path,
      pageProbe.pageId,
      pageProbe.buttons,
    );

    if (!result) {
      return null;
    }

    pagesVisited += 1;
    pageResults.push(result);
    buttonsProbed += result.probes.length;
    buttonsClicked += result.probes.filter(
      (probe) => probe.ok && !probe.skipped && pageProbe.buttons.find((b) => b.id === probe.buttonId)?.clickSafe,
    ).length;

    expect(
      result.missingRequired,
      `${pageProbe.path} should expose required button probes`,
    ).toEqual([]);
  }

  return {
    pagesVisited,
    buttonsProbed,
    buttonsClicked,
    pageResults,
  };
}

export async function runButtonRegressionFlow(page: Page): Promise<ButtonRegressionFlowResult> {
  const steps: string[] = [];

  const contract = runButtonRegressionContractStep();
  steps.push("validate_button_regression_contract");

  const smoke = await runButtonRegressionAuthedSmokeStep(page);
  if (!smoke) {
    return {
      steps,
      contractValid: contract.contractValid,
      pagesVisited: 0,
      buttonsProbed: 0,
      buttonsClicked: 0,
      pageResults: [],
    };
  }

  steps.push("authed_page_button_smoke");

  return {
    steps,
    contractValid: contract.contractValid,
    ...smoke,
  };
}
