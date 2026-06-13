import { test } from "@playwright/test";

export function skipScimProvisionUiE2EIfGateDisabled(): void {
  test.skip(
    process.env.E2E_SCIM_PROVISION_UI?.trim() !== "true",
    "Set E2E_SCIM_PROVISION_UI=true to run SCIM provision UI E2E",
  );
}

export function skipScimProvisionUiE2EIfNotAuthed(): void {
  if (!process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim()) {
    test.skip(
      true,
      "SCIM provision UI E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export function skipScimProvisionUiE2EIfNoDb(): void {
  if (!process.env.DATABASE_URL?.trim()) {
    test.skip(true, "SCIM provision UI E2E SKIPPED — DATABASE_URL required");
  }
}
