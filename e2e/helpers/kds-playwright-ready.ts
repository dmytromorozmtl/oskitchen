import { test } from "@playwright/test";

import {
  hasKdsPlaywrightCredentials,
  isKdsPlaywrightE2EEnabled,
  isKdsPlaywrightGateEnabled,
} from "@/lib/qa/kds-playwright-e2e-policy";

export function skipKdsPlaywrightIfGateDisabled(): void {
  if (!isKdsPlaywrightGateEnabled()) {
    test.skip(
      true,
      "KDS Playwright E2E SKIPPED — set ENABLE_KDS_V1_CERTIFIED=true for non-production KDS v1 gate",
    );
  }
}

export function skipKdsPlaywrightIfE2EGateDisabled(): void {
  if (!isKdsPlaywrightE2EEnabled()) {
    test.skip(
      true,
      "KDS Playwright E2E SKIPPED — set E2E_KDS_PLAYWRIGHT=true",
    );
  }
}

export function skipKdsPlaywrightIfNotAuthed(): void {
  if (!hasKdsPlaywrightCredentials()) {
    test.skip(
      true,
      "KDS Playwright E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}
