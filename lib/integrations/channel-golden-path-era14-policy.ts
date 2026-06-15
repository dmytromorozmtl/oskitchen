/**
 * Channel golden path Era 14 recertification — Evolution Era 14 Cycle 5.
 *
 * Re-validates Era 4 Woo/Shopify golden path + Era 12 order-hub and staging smoke
 * wiring after Era 13/14 operator work. Does not claim full live marketplace ops.
 */

import {
  CHANNEL_GOLDEN_PATH_ERA12_ORDER_HUB_SERVICE_MARKERS,
  CHANNEL_GOLDEN_PATH_ERA12_POLICY_ID,
  CHANNEL_GOLDEN_PATH_ERA12_WORKSPACE_SCOPE_MARKERS,
} from "@/lib/integrations/channel-golden-path-era12-policy";
import {
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_IN_DEFAULT_CI,
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_NPM_SCRIPT,
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_POLICY_ID,
} from "@/lib/integrations/channel-golden-path-smoke-era12-policy";
import {
  CHANNEL_GOLDEN_PATH_HONEST_SCOPE,
  CHANNEL_GOLDEN_PATH_POLICY_ID,
  CHANNEL_GOLDEN_PATH_STAGES,
  CHANNEL_GOLDEN_PATH_WEBHOOK_PROCESSORS,
} from "@/lib/integrations/channel-golden-path-policy";

export const CHANNEL_GOLDEN_PATH_ERA14_POLICY_ID =
  "era14-channel-golden-path-recert-v1" as const;

export const CHANNEL_GOLDEN_PATH_ERA14_EXTENDS_POLICIES = [
  CHANNEL_GOLDEN_PATH_POLICY_ID,
  CHANNEL_GOLDEN_PATH_ERA12_POLICY_ID,
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_POLICY_ID,
] as const;

export const CHANNEL_GOLDEN_PATH_ERA14_STAGES = CHANNEL_GOLDEN_PATH_STAGES;

export const CHANNEL_GOLDEN_PATH_ERA14_HONEST_SCOPE = {
  kitchenOrderAutoCreateFromWebhook:
    CHANNEL_GOLDEN_PATH_HONEST_SCOPE.kitchenOrderAutoCreateFromWebhook,
  externalOrderAndStagingCertified:
    CHANNEL_GOLDEN_PATH_HONEST_SCOPE.externalOrderAndStagingCertified,
  orderHubListsExternalOrders: CHANNEL_GOLDEN_PATH_HONEST_SCOPE.orderHubListsExternalOrders,
  liveStoreApiOptional: CHANNEL_GOLDEN_PATH_HONEST_SCOPE.liveStoreApiOptional,
  stagingSmokeNotInDefaultCi: CHANNEL_GOLDEN_PATH_ERA12_SMOKE_IN_DEFAULT_CI === false,
} as const;

export const CHANNEL_GOLDEN_PATH_ERA14_PILOT_CHECKLIST = [
  "Run npm run test:ci:channel-golden-path:cert before claiming Woo/Shopify integration depth.",
  "Use npm run smoke:woo-shopify with DATABASE_URL for staging — not implied by default CI.",
  "Use --skip-live when validating credentials only; do not claim live REST ping without it.",
  "Demo webhook → externalOrder → order hub list — do not claim automatic kitchen Order creation.",
  "Marketing must match BETA / pilot_ready — not production-certified marketplace parity.",
] as const;

export const CHANNEL_GOLDEN_PATH_ERA14_OPS_DOC =
  "docs/channel-golden-path-honesty-checklist.md" as const;

export const CHANNEL_GOLDEN_PATH_ERA14_SMOKE_SCRIPT = "scripts/smoke-channel-golden-path.ts" as const;

export const CHANNEL_GOLDEN_PATH_ERA14_SMOKE_NPM_SCRIPT = "smoke:channel-golden-path" as const;

export const CHANNEL_GOLDEN_PATH_ERA14_STAGING_SMOKE_NPM_SCRIPT =
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_NPM_SCRIPT;

export const CHANNEL_GOLDEN_PATH_ERA14_CI_SCRIPTS = [
  "test:ci:channel-golden-path-era14",
  "test:ci:channel-golden-path-era14:cert",
] as const;

export const CHANNEL_GOLDEN_PATH_ERA14_UNIT_TESTS = [
  "tests/unit/channel-golden-path-era14-policy.test.ts",
  "tests/unit/channel-golden-path-era14-cert-live.test.ts",
] as const;

export const CHANNEL_GOLDEN_PATH_ERA14_CANONICAL_DOC_PATHS = [
  CHANNEL_GOLDEN_PATH_ERA14_OPS_DOC,
  "docs/WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/qa-master-test-plan.md",
  "docs/feature-maturity-matrix.md",
  "docs/commercial-pilot-runbook.md",
  "docs/implementation-backlog.md",
] as const;

export const CHANNEL_GOLDEN_PATH_ERA14_CANONICAL_MARKERS = [
  CHANNEL_GOLDEN_PATH_ERA14_POLICY_ID,
  CHANNEL_GOLDEN_PATH_POLICY_ID,
  CHANNEL_GOLDEN_PATH_ERA12_POLICY_ID,
  "order_hub_visibility",
  "kitchenOrderAutoCreateFromWebhook",
] as const;

export {
  CHANNEL_GOLDEN_PATH_ERA12_ORDER_HUB_SERVICE_MARKERS,
  CHANNEL_GOLDEN_PATH_ERA12_WORKSPACE_SCOPE_MARKERS,
  CHANNEL_GOLDEN_PATH_WEBHOOK_PROCESSORS,
};

export function findWebhookProcessorsMissingOnDisk(
  exists: (relativePath: string) => boolean,
): string[] {
  const gaps: string[] = [];
  for (const [provider, module] of Object.entries(CHANNEL_GOLDEN_PATH_WEBHOOK_PROCESSORS)) {
    if (!exists(module)) gaps.push(`${provider} (${module})`);
  }
  return gaps;
}

export function findOrderHubVisibilityMarkerGaps(
  readSource: (relativeModule: string) => string,
): string[] {
  const gaps: string[] = [];
  const hub = readSource("services/order-hub/order-hub-service.ts");
  for (const marker of CHANNEL_GOLDEN_PATH_ERA12_ORDER_HUB_SERVICE_MARKERS) {
    if (!hub.includes(marker)) gaps.push(`order-hub missing ${marker}`);
  }
  const scope = readSource("lib/scope/workspace-channel-scope.ts");
  for (const marker of CHANNEL_GOLDEN_PATH_ERA12_WORKSPACE_SCOPE_MARKERS) {
    if (!scope.includes(marker)) gaps.push(`workspace-scope missing ${marker}`);
  }
  return gaps;
}
