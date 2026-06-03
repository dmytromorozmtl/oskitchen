import { test } from "@playwright/test";

export function skipKdsBumpPackingRouteIfNotAuthed(): void {
  if (!process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim()) {
    test.skip(
      true,
      "KDS bump packing route E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}
