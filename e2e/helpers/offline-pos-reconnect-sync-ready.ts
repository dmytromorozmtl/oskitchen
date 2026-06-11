import { test } from "@playwright/test";

import {
  hasOfflinePosReconnectSyncCredentials,
  isOfflinePosReconnectSyncE2EEnabled,
} from "@/lib/qa/offline-pos-reconnect-sync-e2e-policy";

export function skipOfflinePosReconnectSyncIfNotAuthed(): void {
  if (!hasOfflinePosReconnectSyncCredentials()) {
    test.skip(
      true,
      "Offline POS → reconnect → sync E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export function skipOfflinePosReconnectSyncIfGateDisabled(): void {
  if (!isOfflinePosReconnectSyncE2EEnabled()) {
    test.skip(
      true,
      "Offline POS → reconnect → sync E2E SKIPPED — set E2E_OFFLINE_POS_E2E=true",
    );
  }
}
