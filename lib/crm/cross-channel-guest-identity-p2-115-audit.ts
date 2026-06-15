import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CAPABILITIES } from "@/lib/crm/cross-channel-guest-identity-p2-115-content";
import {
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CAPABILITY_COUNT,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_COMPONENT,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_DOC,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_HONESTY_MARKERS,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_BUILDERS,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_HUB_PAGE,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_PANEL,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_SOURCES,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_UNIFIED_POLICY,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_UNIFIED_SERVICE,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_OPERATIONS_PATH,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_PAGE,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_POLICY_ID,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_ROUTE,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_SERVICE_PATH,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_WIRING_PATHS,
} from "@/lib/crm/cross-channel-guest-identity-p2-115-policy";

export type CrossChannelGuestIdentityP2_115AuditSummary = {
  policyId: typeof CROSS_CHANNEL_GUEST_IDENTITY_P2_115_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyUnifiedServiceLinked: boolean;
  legacyUnifiedPolicyLinked: boolean;
  legacyBuildersLinked: boolean;
  legacySourcesLinked: boolean;
  legacyPanelLinked: boolean;
  legacyHubPageLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditCrossChannelGuestIdentityP2_115(
  root = process.cwd(),
): CrossChannelGuestIdentityP2_115AuditSummary {
  const wiringComplete = CROSS_CHANNEL_GUEST_IDENTITY_P2_115_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyUnifiedServiceLinked = false;
  let legacyUnifiedPolicyLinked = false;
  let legacyBuildersLinked = false;
  let legacySourcesLinked = false;
  let legacyPanelLinked = false;
  let legacyHubPageLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_DOC))) {
    const source = readFileSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_DOC), "utf8");
    docWired =
      source.includes(CROSS_CHANNEL_GUEST_IDENTITY_P2_115_ROUTE) &&
      source.includes(String(CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_COMPONENT))) {
    const source = readFileSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_COMPONENT), "utf8");
    componentWired =
      source.includes("CrossChannelGuestIdentityPanel") &&
      source.includes("CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CAPABILITIES");
    allTestIdsPresent =
      source.includes("CROSS_CHANNEL_GUEST_IDENTITY_P2_115_TEST_IDS[0]") &&
      source.includes("CROSS_CHANNEL_GUEST_IDENTITY_P2_115_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_PAGE))) {
    const source = readFileSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_PAGE), "utf8");
    pageWired =
      source.includes("CrossChannelGuestIdentityPanel") &&
      source.includes("CROSS_CHANNEL_GUEST_IDENTITY_P2_115_POLICY_ID");
  }

  if (existsSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("normalizeGuestKey") &&
      source.includes("classifyChannelFromSource") &&
      source.includes("buildCrossChannelGuestRow") &&
      source.includes("buildCrossChannelGuestIdentityDemoReport");
  }

  if (existsSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_SERVICE_PATH))) {
    const source = readFileSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadCrossChannelGuestIdentitySnapshot") &&
      source.includes("CROSS_CHANNEL_GUEST_IDENTITY_P2_115_POLICY_ID");
  }

  if (existsSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_UNIFIED_SERVICE))) {
    const source = readFileSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_UNIFIED_SERVICE), "utf8");
    legacyUnifiedServiceLinked =
      source.includes("loadUnifiedCustomerProfileSnapshot") &&
      source.includes("loadUnifiedProfileHubSnapshot");
  }

  if (existsSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_UNIFIED_POLICY))) {
    const source = readFileSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_UNIFIED_POLICY), "utf8");
    legacyUnifiedPolicyLinked = source.includes("UNIFIED_PROFILE_POLICY_ID");
  }

  if (existsSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_BUILDERS))) {
    const source = readFileSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_BUILDERS), "utf8");
    legacyBuildersLinked = source.includes("buildUnifiedCustomerProfileSnapshot");
  }

  if (existsSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_SOURCES))) {
    const source = readFileSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_SOURCES), "utf8");
    legacySourcesLinked =
      source.includes("customerSourceFromHint") && source.includes("storefront");
  }

  if (existsSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_PANEL))) {
    const source = readFileSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_PANEL), "utf8");
    legacyPanelLinked = source.includes("UnifiedCustomerProfilePanel");
  }

  if (existsSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_HUB_PAGE))) {
    const source = readFileSync(join(root, CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_HUB_PAGE), "utf8");
    legacyHubPageLinked =
      source.includes("loadUnifiedProfileHubSnapshot") &&
      source.includes("Unified Customer Profiles");
  }

  const combinedSources = [
    CROSS_CHANNEL_GUEST_IDENTITY_P2_115_DOC,
    "lib/crm/cross-channel-guest-identity-p2-115-content.ts",
    CROSS_CHANNEL_GUEST_IDENTITY_P2_115_OPERATIONS_PATH,
    CROSS_CHANNEL_GUEST_IDENTITY_P2_115_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = CROSS_CHANNEL_GUEST_IDENTITY_P2_115_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CAPABILITIES.length ===
    CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyUnifiedServiceLinked &&
    legacyUnifiedPolicyLinked &&
    legacyBuildersLinked &&
    legacySourcesLinked &&
    legacyPanelLinked &&
    legacyHubPageLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: CROSS_CHANNEL_GUEST_IDENTITY_P2_115_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyUnifiedServiceLinked,
    legacyUnifiedPolicyLinked,
    legacyBuildersLinked,
    legacySourcesLinked,
    legacyPanelLinked,
    legacyHubPageLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatCrossChannelGuestIdentityP2_115AuditLines(
  summary: CrossChannelGuestIdentityP2_115AuditSummary,
): string[] {
  return [
    `Cross-channel guest identity audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${CROSS_CHANNEL_GUEST_IDENTITY_P2_115_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${CROSS_CHANNEL_GUEST_IDENTITY_P2_115_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy unified service linked: ${summary.legacyUnifiedServiceLinked ? "yes" : "no"}`,
    `Legacy unified policy linked: ${summary.legacyUnifiedPolicyLinked ? "yes" : "no"}`,
    `Legacy builders linked: ${summary.legacyBuildersLinked ? "yes" : "no"}`,
    `Legacy sources linked: ${summary.legacySourcesLinked ? "yes" : "no"}`,
    `Legacy panel linked: ${summary.legacyPanelLinked ? "yes" : "no"}`,
    `Legacy hub page linked: ${summary.legacyHubPageLinked ? "yes" : "no"}`,
    `Capabilities (${CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
