import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  NATIVE_TABLET_UX_P3_145_CAPABILITIES,
} from "@/lib/design/native-tablet-ux-p3-145-content";
import {
  NATIVE_TABLET_UX_P3_145_CAPABILITY_COUNT,
  NATIVE_TABLET_UX_P3_145_CAPABILITY_IDS,
  NATIVE_TABLET_UX_P3_145_COMPONENT,
  NATIVE_TABLET_UX_P3_145_IMPLEMENTATION_REF,
  NATIVE_TABLET_UX_P3_145_MIN_TOUCH_PX,
  NATIVE_TABLET_UX_P3_145_PAGE,
  NATIVE_TABLET_UX_P3_145_POLICY_ID,
  NATIVE_TABLET_UX_P3_145_ROUTE,
} from "@/lib/design/native-tablet-ux-p3-145-policy";
import { auditNativeTabletUxP2_95 } from "@/lib/pos/native-tablet-ux-p2-95-audit";

export type NativeTabletUxTouchbistroCapabilityRecord = {
  id: string;
  label: string;
  route: string;
  testId: string;
  status: string;
};

export type NativeTabletUxTouchbistroRegistry = {
  version: string;
  policyId: typeof NATIVE_TABLET_UX_P3_145_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  competitor: string;
  implementationRef: string;
  minTouchPx: number;
  capabilityCount: number;
  route: string;
  activePilotCount: number;
  capabilities: NativeTabletUxTouchbistroCapabilityRecord[];
};

export function loadNativeTabletUxTouchbistroRegistry(
  root = process.cwd(),
  artifactPath = "artifacts/native-tablet-ux-touchbistro-registry.json",
): NativeTabletUxTouchbistroRegistry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as NativeTabletUxTouchbistroRegistry;
}

export function validateNativeTabletUxTouchbistroRegistry(
  registry: NativeTabletUxTouchbistroRegistry,
): {
  valid: boolean;
  policyIdMatches: boolean;
  touchFloorMatches: boolean;
  capabilitiesComplete: boolean;
  zeroActivePilots: boolean;
} {
  const policyIdMatches = registry.policyId === NATIVE_TABLET_UX_P3_145_POLICY_ID;

  const touchFloorMatches =
    registry.minTouchPx === NATIVE_TABLET_UX_P3_145_MIN_TOUCH_PX &&
    registry.implementationRef === NATIVE_TABLET_UX_P3_145_IMPLEMENTATION_REF &&
    registry.route === NATIVE_TABLET_UX_P3_145_ROUTE;

  const capabilitiesComplete =
    registry.capabilityCount === NATIVE_TABLET_UX_P3_145_CAPABILITY_COUNT &&
    registry.capabilities.length === NATIVE_TABLET_UX_P3_145_CAPABILITY_IDS.length &&
    NATIVE_TABLET_UX_P3_145_CAPABILITY_IDS.every((capabilityId, index) => {
      const record = registry.capabilities[index];
      const expected = NATIVE_TABLET_UX_P3_145_CAPABILITIES[index];
      return (
        record?.id === capabilityId &&
        record.testId === expected?.testId &&
        record.route === expected?.route &&
        record.status === "shipped"
      );
    });

  const zeroActivePilots = registry.activePilotCount === 0;

  const valid =
    policyIdMatches && touchFloorMatches && capabilitiesComplete && zeroActivePilots;

  return {
    valid,
    policyIdMatches,
    touchFloorMatches,
    capabilitiesComplete,
    zeroActivePilots,
  };
}

export function checkNativeTabletUxP2_95BaselineAudit(root = process.cwd()): boolean {
  const summary = auditNativeTabletUxP2_95(root);
  return summary.passed;
}

export function checkNativeTabletUxTouchbistroLiveWiring(root = process.cwd()): boolean {
  const componentPath = join(root, NATIVE_TABLET_UX_P3_145_COMPONENT);
  const pagePath = join(root, NATIVE_TABLET_UX_P3_145_PAGE);

  if (!existsSync(componentPath) || !existsSync(pagePath)) {
    return false;
  }

  const componentSource = readFileSync(componentPath, "utf8");
  const pageSource = readFileSync(pagePath, "utf8");

  const componentWired =
    componentSource.includes("NativeTabletUxTouchbistroPanel") &&
    componentSource.includes("native-tablet-ux-touchbistro") &&
    componentSource.includes(String(NATIVE_TABLET_UX_P3_145_MIN_TOUCH_PX)) &&
    NATIVE_TABLET_UX_P3_145_CAPABILITY_IDS.every((id) => componentSource.includes(id));

  const pageWired =
    pageSource.includes("NativeTabletUxTouchbistroPanel") &&
    pageSource.includes("/dashboard/design/native-tablet-ux");

  return componentWired && pageWired;
}
