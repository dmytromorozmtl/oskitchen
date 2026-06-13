import { test } from "@playwright/test";

import {
  hasButtonRegressionP3_52Credentials,
  isButtonRegressionP3_52Enabled,
} from "@/lib/qa/button-regression-p3-52-policy";

export function skipButtonRegressionP3_52IfGateDisabled(): void {
  if (!isButtonRegressionP3_52Enabled()) {
    test.skip(
      true,
      "Button regression P3-52 SKIPPED — set E2E_BUTTON_REGRESSION_P3_52=true",
    );
  }
}

export function skipButtonRegressionP3_52IfNotAuthed(): void {
  if (!hasButtonRegressionP3_52Credentials()) {
    test.skip(
      true,
      "Button regression P3-52 SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}
