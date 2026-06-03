import { test } from "@playwright/test";

export const hasMultiLocationRollupExportDb = Boolean(process.env.DATABASE_URL?.trim());

export function skipMultiLocationRollupExportIfNotAuthed(): void {
  if (!process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim()) {
    test.skip(
      true,
      "Multi-location rollup export UI E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export function skipMultiLocationRollupExportIfNoDb(): void {
  if (!hasMultiLocationRollupExportDb) {
    test.skip(true, "Multi-location rollup export E2E SKIPPED — missing DATABASE_URL");
  }
}

export function skipMultiLocationRollupExportHttpIfNoBaseUrl(): void {
  const base =
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
    process.env.SMOKE_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!base) {
    test.skip(
      true,
      "Multi-location rollup export HTTP E2E SKIPPED — set PLAYWRIGHT_BASE_URL (running app required)",
    );
  }
}
