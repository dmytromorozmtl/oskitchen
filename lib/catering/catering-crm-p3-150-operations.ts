import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { CATERING_CRM_P3_150_CAPABILITIES } from "@/lib/catering/catering-crm-p3-150-content";
import {
  CATERING_CRM_P3_150_CAPABILITY_COUNT,
  CATERING_CRM_P3_150_CAPABILITY_IDS,
  CATERING_CRM_P3_150_COMPONENT,
  CATERING_CRM_P3_150_LEGACY_CONVERSION,
  CATERING_CRM_P3_150_LEGACY_DEPOSIT,
  CATERING_CRM_P3_150_LEGACY_QUOTE_DETAIL,
  CATERING_CRM_P3_150_LEGACY_QUOTES_ACTIONS,
  CATERING_CRM_P3_150_LEGACY_QUOTE_SERVICE,
  CATERING_CRM_P3_150_PAGE,
  CATERING_CRM_P3_150_POLICY_ID,
  CATERING_CRM_P3_150_ROUTE,
  CATERING_CRM_P3_150_SECONDARY_REF,
} from "@/lib/catering/catering-crm-p3-150-policy";
import { auditCateringOsSmokeWiring } from "@/lib/catering/catering-os-smoke-summary";

export type CateringCrmCapabilityRecord = {
  id: string;
  label: string;
  route: string;
  testId: string;
  status: string;
};

export type CateringCrmTripleseatRegistry = {
  version: string;
  policyId: typeof CATERING_CRM_P3_150_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  competitor: string;
  implementationRef: string;
  secondaryRef: string;
  capabilityCount: number;
  route: string;
  activePilotCount: number;
  capabilities: CateringCrmCapabilityRecord[];
};

export function loadCateringCrmTripleseatRegistry(
  root = process.cwd(),
  artifactPath = "artifacts/catering-crm-tripleseat-registry.json",
): CateringCrmTripleseatRegistry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as CateringCrmTripleseatRegistry;
}

export function validateCateringCrmTripleseatRegistry(registry: CateringCrmTripleseatRegistry): {
  valid: boolean;
  policyIdMatches: boolean;
  capabilitiesComplete: boolean;
  zeroActivePilots: boolean;
} {
  const policyIdMatches = registry.policyId === CATERING_CRM_P3_150_POLICY_ID;

  const capabilitiesComplete =
    registry.capabilityCount === CATERING_CRM_P3_150_CAPABILITY_COUNT &&
    registry.route === CATERING_CRM_P3_150_ROUTE &&
    registry.secondaryRef === CATERING_CRM_P3_150_SECONDARY_REF &&
    registry.capabilities.length === CATERING_CRM_P3_150_CAPABILITY_IDS.length &&
    CATERING_CRM_P3_150_CAPABILITY_IDS.every((capabilityId, index) => {
      const record = registry.capabilities[index];
      const expected = CATERING_CRM_P3_150_CAPABILITIES[index];
      return (
        record?.id === capabilityId &&
        record.testId === expected?.testId &&
        record.route === expected?.route &&
        (record.status === "shipped" || record.status === "BETA")
      );
    });

  const zeroActivePilots = registry.activePilotCount === 0;

  const valid = policyIdMatches && capabilitiesComplete && zeroActivePilots;

  return {
    valid,
    policyIdMatches,
    capabilitiesComplete,
    zeroActivePilots,
  };
}

export function checkCateringCrmCateringOsAudit(root = process.cwd()): boolean {
  return auditCateringOsSmokeWiring(root).ok;
}

export function checkCateringCrmQuotesWiring(root = process.cwd()): boolean {
  const actionsPath = join(root, CATERING_CRM_P3_150_LEGACY_QUOTES_ACTIONS);
  const servicePath = join(root, CATERING_CRM_P3_150_LEGACY_QUOTE_SERVICE);

  if (!existsSync(actionsPath) || !existsSync(servicePath)) {
    return false;
  }

  const actionsSource = readFileSync(actionsPath, "utf8");
  const serviceSource = readFileSync(servicePath, "utf8");

  return (
    actionsSource.includes("createQuote") &&
    actionsSource.includes("convertQuoteToOrder") &&
    serviceSource.includes("createQuote") &&
    serviceSource.includes("setQuoteStatus")
  );
}

export function checkCateringCrmDepositWiring(root = process.cwd()): boolean {
  const depositPath = join(root, CATERING_CRM_P3_150_LEGACY_DEPOSIT);
  const conversionPath = join(root, CATERING_CRM_P3_150_LEGACY_CONVERSION);

  if (!existsSync(depositPath) || !existsSync(conversionPath)) {
    return false;
  }

  const depositSource = readFileSync(depositPath, "utf8");
  const conversionSource = readFileSync(conversionPath, "utf8");

  return (
    depositSource.includes("createCateringDepositCheckoutSession") &&
    conversionSource.includes("createCateringDepositCheckoutSession")
  );
}

export function checkCateringCrmEventSheetsWiring(root = process.cwd()): boolean {
  const quoteDetailPath = join(root, CATERING_CRM_P3_150_LEGACY_QUOTE_DETAIL);

  if (!existsSync(quoteDetailPath)) {
    return false;
  }

  const quoteDetailSource = readFileSync(quoteDetailPath, "utf8");

  return (
    quoteDetailSource.includes("workflowsForEvent") &&
    quoteDetailSource.includes("event_sheets") === false &&
    quoteDetailSource.includes("workflowsForEvent")
  );
}

export function checkCateringCrmLiveWiring(root = process.cwd()): boolean {
  const componentPath = join(root, CATERING_CRM_P3_150_COMPONENT);
  const pagePath = join(root, CATERING_CRM_P3_150_PAGE);

  if (!existsSync(componentPath) || !existsSync(pagePath)) {
    return false;
  }

  const componentSource = readFileSync(componentPath, "utf8");
  const pageSource = readFileSync(pagePath, "utf8");

  const componentWired =
    componentSource.includes("CateringCrmPanel") &&
    componentSource.includes("catering-crm-tripleseat") &&
    CATERING_CRM_P3_150_CAPABILITY_IDS.every((id) => componentSource.includes(id));

  const pageWired =
    pageSource.includes("CateringCrmPanel") && pageSource.includes(CATERING_CRM_P3_150_ROUTE);

  return componentWired && pageWired;
}
