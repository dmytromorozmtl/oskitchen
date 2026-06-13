import { test } from "@playwright/test";

export function skipQrScanStorefrontKdsIfGateDisabled(): void {
  test.skip(
    process.env.E2E_QR_SCAN_STOREFRONT_KDS?.trim() !== "true",
    "Set E2E_QR_SCAN_STOREFRONT_KDS=true to run QR scan→storefront→KDS E2E",
  );
}

export function skipQrScanStorefrontKdsIfNotAuthed(): void {
  if (!process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim()) {
    test.skip(
      true,
      "QR scan→storefront→KDS E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export function skipQrScanStorefrontKdsIfTurnstileEnabled(): void {
  test.skip(
    Boolean(process.env.TURNSTILE_SECRET_KEY?.trim()),
    "Run with TURNSTILE_SECRET_KEY unset so captcha is a no-op",
  );
}
