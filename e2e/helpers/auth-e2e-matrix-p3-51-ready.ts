import { test } from "@playwright/test";

import {
  hasOwnerAuthE2eMatrixCredentials,
  isAuthE2eMatrixP3_51Enabled,
} from "@/lib/qa/auth-e2e-matrix-p3-51-policy";

export function skipAuthE2eMatrixP3_51IfGateDisabled(): void {
  if (!isAuthE2eMatrixP3_51Enabled()) {
    test.skip(
      true,
      "Auth E2E matrix P3-51 SKIPPED — set E2E_AUTH_E2E_MATRIX=true",
    );
  }
}

export function skipAuthE2eMatrixP3_51IfNotAuthed(): void {
  if (!hasOwnerAuthE2eMatrixCredentials()) {
    test.skip(
      true,
      "Auth E2E matrix P3-51 SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}
