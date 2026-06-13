import { test } from "@playwright/test";

import { isNegativeTestSuiteP3_54Enabled } from "@/lib/qa/negative-test-suite-p3-54-policy";

export function skipNegativeTestSuiteP3_54IfGateDisabled(): void {
  if (!isNegativeTestSuiteP3_54Enabled()) {
    test.skip(
      true,
      "Negative test suite P3-54 SKIPPED — set E2E_NEGATIVE_TEST_SUITE=true",
    );
  }
}
