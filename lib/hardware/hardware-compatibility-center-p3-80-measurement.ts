import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditHardwareCompatibilityCenter } from "@/lib/hardware/hardware-compatibility-center-audit";
import {
  HARDWARE_COMPATIBILITY_CENTER_P3_80_CERTIFIED_DOC,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_DIAGNOSTIC_COUNT,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_PAGE,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_ROADMAP_DOC,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_ROUTE,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_TAGLINE,
  HARDWARE_COMPATIBILITY_CENTER_P3_80_UPSTREAM_POLICY_ID,
} from "@/lib/hardware/hardware-compatibility-center-p3-80-policy";

export type HardwareCompatibilityCenterContractValidation = {
  passed: boolean;
  upstreamCenterOk: boolean;
  publicPageWired: boolean;
  roadmapLinked: boolean;
  certifiedDevicesLinked: boolean;
  failures: string[];
};

export function validateHardwareCompatibilityCenterContract(
  root = process.cwd(),
): HardwareCompatibilityCenterContractValidation {
  const failures: string[] = [];

  const upstream = auditHardwareCompatibilityCenter(root);
  const upstreamCenterOk =
    upstream.passed && upstream.policyId === HARDWARE_COMPATIBILITY_CENTER_P3_80_UPSTREAM_POLICY_ID;
  if (!upstreamCenterOk) {
    failures.push("upstream hardware compatibility center audit failed");
  }

  let publicPageWired = false;
  const pagePath = join(root, HARDWARE_COMPATIBILITY_CENTER_P3_80_PAGE);
  if (!existsSync(pagePath)) {
    failures.push(`missing public page: ${HARDWARE_COMPATIBILITY_CENTER_P3_80_PAGE}`);
  } else {
    const source = readFileSync(pagePath, "utf8");
    publicPageWired =
      source.includes("HardwareCompatibilityCenter") &&
      (source.includes(HARDWARE_COMPATIBILITY_CENTER_P3_80_TAGLINE) ||
        source.includes("HARDWARE_COMPATIBILITY_CENTER_TAGLINE")) &&
      (source.includes(HARDWARE_COMPATIBILITY_CENTER_P3_80_ROUTE) ||
        source.includes("HARDWARE_COMPATIBILITY_CENTER_ROUTE"));
    if (!publicPageWired) {
      failures.push("works-with-os-kitchen page missing center wiring");
    }
  }

  let roadmapLinked = false;
  const roadmapPath = join(root, HARDWARE_COMPATIBILITY_CENTER_P3_80_ROADMAP_DOC);
  if (!existsSync(roadmapPath)) {
    failures.push(`missing roadmap doc: ${HARDWARE_COMPATIBILITY_CENTER_P3_80_ROADMAP_DOC}`);
  } else {
    const source = readFileSync(roadmapPath, "utf8");
    roadmapLinked = source.includes(HARDWARE_COMPATIBILITY_CENTER_P3_80_ROUTE);
    if (!roadmapLinked) {
      failures.push("hardware roadmap missing compatibility center route link");
    }
  }

  let certifiedDevicesLinked = false;
  const certifiedPath = join(root, HARDWARE_COMPATIBILITY_CENTER_P3_80_CERTIFIED_DOC);
  if (!existsSync(certifiedPath)) {
    failures.push(`missing certified devices doc: ${HARDWARE_COMPATIBILITY_CENTER_P3_80_CERTIFIED_DOC}`);
  } else {
    const source = readFileSync(certifiedPath, "utf8");
    certifiedDevicesLinked =
      source.includes("hardware-compatibility-roadmap") ||
      source.includes("certified-hardware-guide");
    if (!certifiedDevicesLinked) {
      failures.push("certified devices doc missing hardware cross-refs");
    }
  }

  if (upstreamCenterOk && upstream.diagnosticCountCorrect === false) {
    failures.push(
      `diagnostic count drift: expected ${HARDWARE_COMPATIBILITY_CENTER_P3_80_DIAGNOSTIC_COUNT}`,
    );
  }

  return {
    passed: failures.length === 0,
    upstreamCenterOk,
    publicPageWired,
    roadmapLinked,
    certifiedDevicesLinked,
    failures,
  };
}
