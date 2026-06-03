import { test } from "@playwright/test";

export const hasRefundFlowDb = Boolean(process.env.DATABASE_URL?.trim());

export function skipRefundFlowIfNotAuthed(): void {
  if (!process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim()) {
    test.skip(
      true,
      "Refund flow UI E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export function skipRefundFlowIfNoDb(): void {
  if (!hasRefundFlowDb) {
    test.skip(true, "Refund flow E2E SKIPPED — missing DATABASE_URL");
  }
}
