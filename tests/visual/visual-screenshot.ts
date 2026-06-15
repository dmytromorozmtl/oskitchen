import type { PageScreenshotOptions } from "@playwright/test";

/** Shared Playwright screenshot options for storefront visual baselines. */
export const visualScreenshotOptions: PageScreenshotOptions = {
  fullPage: true,
  animations: "disabled",
  caret: "hide",
};
