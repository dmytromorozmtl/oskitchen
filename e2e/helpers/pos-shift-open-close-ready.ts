import { test } from "@playwright/test";

import {
  hasPosShiftOpenCloseCredentials,
  isPosShiftOpenCloseE2EEnabled,
} from "@/lib/qa/pos-shift-open-close-e2e-policy";

export function skipPosShiftOpenCloseIfGateDisabled(): void {
  if (!isPosShiftOpenCloseE2EEnabled()) {
    test.skip(
      true,
      "POS shift open → close E2E SKIPPED — set E2E_POS_SHIFT_OPEN_CLOSE=true",
    );
  }
}

export function skipPosShiftOpenCloseIfNotAuthed(): void {
  if (!hasPosShiftOpenCloseCredentials()) {
    test.skip(
      true,
      "POS shift open → close E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}
