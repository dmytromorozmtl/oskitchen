import { test } from "@playwright/test";

export function skipTodayBetaEnvFootnoteIfNotAuthed(): void {
  if (!process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim()) {
    test.skip(
      true,
      "Today BETA env footnote E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}
