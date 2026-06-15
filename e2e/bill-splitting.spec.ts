import { test } from "@playwright/test";

import { runBillSplitPanelSmokeFlow } from "./helpers/bill-splitting-flow";
import { skipBillSplittingIfNotAuthed } from "./helpers/bill-splitting-ready";

/**
 * Staging POS bill splitting smoke (chromium-authed).
 *
 * @see e2e/bill-splitting-e2e.spec.ts — QA-32 policy + accuracy contract
 * @see docs/BILL_SPLITTING.md
 */

test.describe("Bill splitting", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Bill splitting smoke runs in chromium-authed project only",
    );
    skipBillSplittingIfNotAuthed();
  });

  test("shows split panel on tabs page when tab has items", async ({ page }) => {
    await runBillSplitPanelSmokeFlow(page);
  });
});
