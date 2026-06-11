import { test } from "@playwright/test";

import {
  hasKdsBumpExpoCredentials,
  isKdsBumpExpoGateEnabled,
} from "@/lib/kitchen/kds-bump-expo-e2e-policy";

export function skipKdsBumpExpoIfNotAuthed(): void {
  if (!hasKdsBumpExpoCredentials()) {
    test.skip(
      true,
      "KDS bump → expo E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export function skipKdsBumpExpoIfGateDisabled(): void {
  if (!isKdsBumpExpoGateEnabled()) {
    test.skip(
      true,
      "KDS bump → expo E2E SKIPPED — set ENABLE_KDS_V1_CERTIFIED=true for non-production KDS v1 gate",
    );
  }
}
