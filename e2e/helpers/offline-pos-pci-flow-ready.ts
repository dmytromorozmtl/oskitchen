import { test } from "@playwright/test";

import {
  hasOfflinePosPciFlowE2ECredentials,
  isOfflinePosPciFlowE2EEnabled,
} from "@/lib/qa/offline-pos-pci-flow-e2e-policy";

export function skipOfflinePosPciFlowIfNotAuthed(): void {
  if (!hasOfflinePosPciFlowE2ECredentials()) {
    test.skip(
      true,
      "Offline POS PCI flow E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export function skipOfflinePosPciFlowIfGateDisabled(): void {
  if (!isOfflinePosPciFlowE2EEnabled()) {
    test.skip(true, "Offline POS PCI flow E2E SKIPPED — set E2E_OFFLINE_POS_PCI_FLOW=true");
  }
}
