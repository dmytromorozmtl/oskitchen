import { test } from "@playwright/test";

export function skipCsrfServerActionsHttpIfNoBaseUrl(): void {
  const base =
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
    process.env.SMOKE_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!base) {
    test.skip(
      true,
      "CSRF server actions HTTP E2E SKIPPED — set PLAYWRIGHT_BASE_URL (running app required)",
    );
  }
}

export function resolveCsrfHttpBaseOrigin(): string | null {
  const base =
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
    process.env.SMOKE_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!base) return null;
  try {
    return new URL(base).origin;
  } catch {
    return null;
  }
}
