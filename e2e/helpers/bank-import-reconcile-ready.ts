import { test } from "@playwright/test";

import {
  hasBankImportReconcileCredentials,
  isBankImportReconcileE2EEnabled,
} from "@/lib/qa/bank-import-reconcile-e2e-policy";

export function skipBankImportReconcileIfNotAuthed(): void {
  if (!hasBankImportReconcileCredentials()) {
    test.skip(
      true,
      "Bank import → reconcile E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export function skipBankImportReconcileIfGateDisabled(): void {
  if (!isBankImportReconcileE2EEnabled()) {
    test.skip(
      true,
      "Bank import → reconcile E2E SKIPPED — set E2E_BANK_IMPORT_E2E=true",
    );
  }
}
