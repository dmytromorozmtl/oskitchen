import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditRouteOptimizationP2_114 } from "@/lib/delivery/route-optimization-p2-114-audit";
import { DELIVERY_ORCHESTRATION_P3_147_CAPABILITIES } from "@/lib/delivery/delivery-orchestration-p3-147-content";
import {
  DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_COUNT,
  DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_IDS,
  DELIVERY_ORCHESTRATION_P3_147_COMPONENT,
  DELIVERY_ORCHESTRATION_P3_147_LEGACY_DISPATCH,
  DELIVERY_ORCHESTRATION_P3_147_LEGACY_ORDER_HUB,
  DELIVERY_ORCHESTRATION_P3_147_PAGE,
  DELIVERY_ORCHESTRATION_P3_147_POLICY_ID,
  DELIVERY_ORCHESTRATION_P3_147_ROUTE,
  DELIVERY_ORCHESTRATION_P3_147_SECONDARY_REF,
} from "@/lib/delivery/delivery-orchestration-p3-147-policy";

export type DeliveryOrchestrationCapabilityRecord = {
  id: string;
  label: string;
  route: string;
  testId: string;
  status: string;
};

export type DeliveryOrchestrationOloRegistry = {
  version: string;
  policyId: typeof DELIVERY_ORCHESTRATION_P3_147_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  competitor: string;
  implementationRef: string;
  secondaryRef: string;
  capabilityCount: number;
  route: string;
  activePilotCount: number;
  capabilities: DeliveryOrchestrationCapabilityRecord[];
};

export function loadDeliveryOrchestrationOloRegistry(
  root = process.cwd(),
  artifactPath = "artifacts/delivery-orchestration-olo-registry.json",
): DeliveryOrchestrationOloRegistry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as DeliveryOrchestrationOloRegistry;
}

export function validateDeliveryOrchestrationOloRegistry(
  registry: DeliveryOrchestrationOloRegistry,
): {
  valid: boolean;
  policyIdMatches: boolean;
  capabilitiesComplete: boolean;
  zeroActivePilots: boolean;
} {
  const policyIdMatches = registry.policyId === DELIVERY_ORCHESTRATION_P3_147_POLICY_ID;

  const capabilitiesComplete =
    registry.capabilityCount === DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_COUNT &&
    registry.route === DELIVERY_ORCHESTRATION_P3_147_ROUTE &&
    registry.secondaryRef === DELIVERY_ORCHESTRATION_P3_147_SECONDARY_REF &&
    registry.capabilities.length === DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_IDS.length &&
    DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_IDS.every((capabilityId, index) => {
      const record = registry.capabilities[index];
      const expected = DELIVERY_ORCHESTRATION_P3_147_CAPABILITIES[index];
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

export function checkDeliveryOrchestrationRouteOptimizationAudit(root = process.cwd()): boolean {
  const summary = auditRouteOptimizationP2_114(root);
  return summary.passed;
}

export function checkDeliveryOrchestrationLegacyDispatchWiring(root = process.cwd()): boolean {
  const dispatchPath = join(root, DELIVERY_ORCHESTRATION_P3_147_LEGACY_DISPATCH);
  const orderHubPath = join(root, DELIVERY_ORCHESTRATION_P3_147_LEGACY_ORDER_HUB);

  if (!existsSync(dispatchPath) || !existsSync(orderHubPath)) {
    return false;
  }

  const dispatchSource = readFileSync(dispatchPath, "utf8");
  const orderHubSource = readFileSync(orderHubPath, "utf8");

  return (
    dispatchSource.includes("optimizeDispatchStopOrder") &&
    orderHubSource.includes("OrderHubPage") &&
    orderHubSource.includes("/dashboard/order-hub")
  );
}

export function checkDeliveryOrchestrationLiveWiring(root = process.cwd()): boolean {
  const componentPath = join(root, DELIVERY_ORCHESTRATION_P3_147_COMPONENT);
  const pagePath = join(root, DELIVERY_ORCHESTRATION_P3_147_PAGE);

  if (!existsSync(componentPath) || !existsSync(pagePath)) {
    return false;
  }

  const componentSource = readFileSync(componentPath, "utf8");
  const pageSource = readFileSync(pagePath, "utf8");

  const componentWired =
    componentSource.includes("DeliveryOrchestrationPanel") &&
    componentSource.includes("delivery-orchestration-olo") &&
    DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_IDS.every((id) => componentSource.includes(id));

  const pageWired =
    pageSource.includes("DeliveryOrchestrationPanel") &&
    pageSource.includes("/dashboard/delivery/orchestration");

  return componentWired && pageWired;
}
