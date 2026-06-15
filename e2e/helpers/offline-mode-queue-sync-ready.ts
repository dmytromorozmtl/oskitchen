import { test } from "@playwright/test";

export function skipOfflineModeQueueSyncIfNotAuthed(): void {
  if (!process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim()) {
    test.skip(
      true,
      "Offline mode queue+sync UI E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}
