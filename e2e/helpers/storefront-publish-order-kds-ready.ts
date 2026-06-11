import { test } from "@playwright/test";

import {
  hasStorefrontPublishOrderKdsCredentials,
  isStorefrontPublishOrderKdsE2EEnabled,
  isStorefrontPublishOrderKdsKdsGateEnabled,
} from "@/lib/qa/storefront-publish-order-kds-e2e-policy";

export function skipStorefrontPublishOrderKdsIfNotAuthed(): void {
  if (!hasStorefrontPublishOrderKdsCredentials()) {
    test.skip(
      true,
      "Storefront publish → order → KDS E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export function skipStorefrontPublishOrderKdsIfGateDisabled(): void {
  if (!isStorefrontPublishOrderKdsE2EEnabled()) {
    test.skip(
      true,
      "Storefront publish → order → KDS E2E SKIPPED — set E2E_STOREFRONT_PUBLISH_E2E=true",
    );
  }
}

export function skipStorefrontPublishOrderKdsIfKdsGateDisabled(): void {
  if (!isStorefrontPublishOrderKdsKdsGateEnabled()) {
    test.skip(
      true,
      "Set ENABLE_KDS_V1_CERTIFIED=true for non-production KDS v1 gate",
    );
  }
}
