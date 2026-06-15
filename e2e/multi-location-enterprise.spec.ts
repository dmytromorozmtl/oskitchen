import { test } from "@playwright/test";

import { runMultiLocationRollupExportPanelFlow } from "./helpers/multi-location-rollup-export-flow";
import { skipMultiLocationRollupExportIfNotAuthed } from "./helpers/multi-location-rollup-export-ready";

/**
 * Enterprise multi-location smoke (chromium-authed).
 *
 * @see e2e/multi-location-rollup-export-e2e.spec.ts — QA-33 export contract
 */

test.describe("enterprise multi-location", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Enterprise multi-location smoke runs in chromium-authed project only",
    );
    skipMultiLocationRollupExportIfNotAuthed();
  });

  test("enterprise page shows panel and rollup export controls", async ({ page }) => {
    await runMultiLocationRollupExportPanelFlow(page);
  });
});
