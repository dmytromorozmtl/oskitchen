import { test } from "@playwright/test";

import { isVisualQaP3_55Enabled } from "@/lib/qa/visual-qa-p3-55-policy";

export function skipVisualQaP3_55IfGateDisabled(): void {
  if (!isVisualQaP3_55Enabled()) {
    test.skip(true, "Visual QA P3-55 SKIPPED — set E2E_VISUAL_QA_P3_55=true");
  }
}
