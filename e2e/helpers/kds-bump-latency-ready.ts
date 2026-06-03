import { test } from "@playwright/test";

export function skipKdsBumpLatencyIfNotAuthed(): void {
  if (!process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim()) {
    test.skip(
      true,
      "KDS bump latency UI E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export const kdsBumpLatencyGateEnabled =
  process.env.NODE_ENV === "production" || process.env.ENABLE_KDS_V1_CERTIFIED === "true";

export function skipKdsBumpLatencyIfGateDisabled(): void {
  if (!kdsBumpLatencyGateEnabled) {
    test.skip(true, "Set ENABLE_KDS_V1_CERTIFIED=true for non-production KDS bump latency gate");
  }
}
