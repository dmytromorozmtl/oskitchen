import { test } from "@playwright/test";

import {
  hasIntegrationTestPackP3_53Credentials,
  isIntegrationTestPackP3_53Enabled,
} from "@/lib/qa/integration-test-pack-p3-53-policy";

export function skipIntegrationTestPackP3_53IfGateDisabled(): void {
  if (!isIntegrationTestPackP3_53Enabled()) {
    test.skip(
      true,
      "Integration test pack P3-53 SKIPPED — set E2E_INTEGRATION_TEST_PACK=true",
    );
  }
}

export function skipIntegrationTestPackP3_53IfNotAuthed(): void {
  if (!hasIntegrationTestPackP3_53Credentials()) {
    test.skip(
      true,
      "Integration test pack P3-53 SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}
