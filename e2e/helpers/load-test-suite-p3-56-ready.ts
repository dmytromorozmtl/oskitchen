import { test } from "@playwright/test";

import { isLoadTestSuiteP3_56Enabled } from "@/lib/qa/load-test-suite-p3-56-policy";

export function skipLoadTestSuiteP3_56IfGateDisabled(): void {
  if (!isLoadTestSuiteP3_56Enabled()) {
    test.skip(true, "Load test suite P3-56 SKIPPED — set E2E_LOAD_TEST_SUITE=true");
  }
}
