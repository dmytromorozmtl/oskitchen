import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { VENDOR_ONBOARDING_PORTAL_P2_116_CAPABILITIES } from "@/lib/marketplace/vendor-onboarding-portal-p2-116-content";
import {
  VENDOR_ONBOARDING_PORTAL_P2_116_CAPABILITY_COUNT,
  VENDOR_ONBOARDING_PORTAL_P2_116_COMPONENT,
  VENDOR_ONBOARDING_PORTAL_P2_116_DOC,
  VENDOR_ONBOARDING_PORTAL_P2_116_HONESTY_MARKERS,
  VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_PRODUCTS,
  VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_REGISTRATION,
  VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_SETTINGS,
  VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_SETTINGS_TYPES,
  VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_WIZARD,
  VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_WIZARD_COMPONENT,
  VENDOR_ONBOARDING_PORTAL_P2_116_OPERATIONS_PATH,
  VENDOR_ONBOARDING_PORTAL_P2_116_PAGE,
  VENDOR_ONBOARDING_PORTAL_P2_116_POLICY_ID,
  VENDOR_ONBOARDING_PORTAL_P2_116_ROUTE,
  VENDOR_ONBOARDING_PORTAL_P2_116_SERVICE_PATH,
  VENDOR_ONBOARDING_PORTAL_P2_116_WIRING_PATHS,
} from "@/lib/marketplace/vendor-onboarding-portal-p2-116-policy";

export type VendorOnboardingPortalP2_116AuditSummary = {
  policyId: typeof VENDOR_ONBOARDING_PORTAL_P2_116_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyRegistrationLinked: boolean;
  legacySettingsLinked: boolean;
  legacySettingsTypesLinked: boolean;
  legacyWizardLinked: boolean;
  legacyWizardComponentLinked: boolean;
  legacyProductsLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditVendorOnboardingPortalP2_116(
  root = process.cwd(),
): VendorOnboardingPortalP2_116AuditSummary {
  const wiringComplete = VENDOR_ONBOARDING_PORTAL_P2_116_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyRegistrationLinked = false;
  let legacySettingsLinked = false;
  let legacySettingsTypesLinked = false;
  let legacyWizardLinked = false;
  let legacyWizardComponentLinked = false;
  let legacyProductsLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_DOC))) {
    const source = readFileSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_DOC), "utf8");
    docWired =
      source.includes(VENDOR_ONBOARDING_PORTAL_P2_116_ROUTE) &&
      source.includes(String(VENDOR_ONBOARDING_PORTAL_P2_116_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_COMPONENT))) {
    const source = readFileSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_COMPONENT), "utf8");
    componentWired =
      source.includes("VendorOnboardingPortalPanel") &&
      source.includes("VENDOR_ONBOARDING_PORTAL_P2_116_CAPABILITIES");
    allTestIdsPresent =
      source.includes("VENDOR_ONBOARDING_PORTAL_P2_116_TEST_IDS[0]") &&
      source.includes("VENDOR_ONBOARDING_PORTAL_P2_116_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_PAGE))) {
    const source = readFileSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_PAGE), "utf8");
    pageWired =
      source.includes("VendorOnboardingPortalPanel") &&
      source.includes("VENDOR_ONBOARDING_PORTAL_P2_116_POLICY_ID");
  }

  if (existsSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildCatalogImportBlock") &&
      source.includes("buildPricingTierBlock") &&
      source.includes("buildDeliveryZonesBlock") &&
      source.includes("buildCutoffTimeBlock") &&
      source.includes("buildMoqBlock") &&
      source.includes("buildVendorOnboardingPortalDemoReport");
  }

  if (existsSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_SERVICE_PATH))) {
    const source = readFileSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadVendorOnboardingPortalSnapshot") &&
      source.includes("VENDOR_ONBOARDING_PORTAL_P2_116_POLICY_ID");
  }

  if (existsSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_REGISTRATION))) {
    const source = readFileSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_REGISTRATION), "utf8");
    legacyRegistrationLinked =
      source.includes("submitVendorRegistration") &&
      source.includes("loadWorkspaceVendorRegistration");
  }

  if (existsSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_SETTINGS))) {
    const source = readFileSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_SETTINGS), "utf8");
    legacySettingsLinked = source.includes("loadVendorSettings");
  }

  if (existsSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_SETTINGS_TYPES))) {
    const source = readFileSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_SETTINGS_TYPES), "utf8");
    legacySettingsTypesLinked =
      source.includes("VENDOR_PLAN_OPTIONS") && source.includes("deliveryZones");
  }

  if (existsSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_WIZARD))) {
    const source = readFileSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_WIZARD), "utf8");
    legacyWizardLinked = source.includes("buildVendorOnboardingSteps");
  }

  if (existsSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_WIZARD_COMPONENT))) {
    const source = readFileSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_WIZARD_COMPONENT), "utf8");
    legacyWizardComponentLinked = source.includes("VendorDashboardOnboardingWizard");
  }

  if (existsSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_PRODUCTS))) {
    const source = readFileSync(join(root, VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_PRODUCTS), "utf8");
    legacyProductsLinked = source.includes("VendorProductInput") && source.includes("moq");
  }

  const combinedSources = [
    VENDOR_ONBOARDING_PORTAL_P2_116_DOC,
    "lib/marketplace/vendor-onboarding-portal-p2-116-content.ts",
    VENDOR_ONBOARDING_PORTAL_P2_116_OPERATIONS_PATH,
    VENDOR_ONBOARDING_PORTAL_P2_116_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = VENDOR_ONBOARDING_PORTAL_P2_116_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    VENDOR_ONBOARDING_PORTAL_P2_116_CAPABILITIES.length ===
    VENDOR_ONBOARDING_PORTAL_P2_116_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyRegistrationLinked &&
    legacySettingsLinked &&
    legacySettingsTypesLinked &&
    legacyWizardLinked &&
    legacyWizardComponentLinked &&
    legacyProductsLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: VENDOR_ONBOARDING_PORTAL_P2_116_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyRegistrationLinked,
    legacySettingsLinked,
    legacySettingsTypesLinked,
    legacyWizardLinked,
    legacyWizardComponentLinked,
    legacyProductsLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatVendorOnboardingPortalP2_116AuditLines(
  summary: VendorOnboardingPortalP2_116AuditSummary,
): string[] {
  return [
    `Vendor onboarding portal audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${VENDOR_ONBOARDING_PORTAL_P2_116_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${VENDOR_ONBOARDING_PORTAL_P2_116_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy registration linked: ${summary.legacyRegistrationLinked ? "yes" : "no"}`,
    `Legacy settings linked: ${summary.legacySettingsLinked ? "yes" : "no"}`,
    `Legacy settings types linked: ${summary.legacySettingsTypesLinked ? "yes" : "no"}`,
    `Legacy wizard linked: ${summary.legacyWizardLinked ? "yes" : "no"}`,
    `Legacy wizard component linked: ${summary.legacyWizardComponentLinked ? "yes" : "no"}`,
    `Legacy products linked: ${summary.legacyProductsLinked ? "yes" : "no"}`,
    `Capabilities (${VENDOR_ONBOARDING_PORTAL_P2_116_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
