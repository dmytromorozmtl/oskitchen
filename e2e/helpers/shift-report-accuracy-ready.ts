import { test } from "@playwright/test";

export function skipShiftReportAccuracyIfNotAuthed(): void {
  if (!process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim()) {
    test.skip(
      true,
      "Shift report accuracy UI E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export const hasShiftReportAccuracyDb = Boolean(process.env.DATABASE_URL?.trim());

export function skipShiftReportAccuracyIfNoDb(): void {
  if (!hasShiftReportAccuracyDb) {
    test.skip(true, "Shift report accuracy E2E SKIPPED — missing DATABASE_URL");
  }
}
