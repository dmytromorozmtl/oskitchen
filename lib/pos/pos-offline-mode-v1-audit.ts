import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { POS_OFFLINE_MODE_V1_CAPABILITIES } from "@/lib/pos/pos-offline-mode-v1-content";
import {
  POS_OFFLINE_MODE_V1_CAPABILITY_COUNT,
  POS_OFFLINE_MODE_V1_COMPONENT,
  POS_OFFLINE_MODE_V1_DOC,
  POS_OFFLINE_MODE_V1_HONESTY_MARKERS,
  POS_OFFLINE_MODE_V1_LOCAL_CART_PATH,
  POS_OFFLINE_MODE_V1_PAGE,
  POS_OFFLINE_MODE_V1_POLICY_ID,
  POS_OFFLINE_MODE_V1_ROUTE,
  POS_OFFLINE_MODE_V1_TEST_IDS,
  POS_OFFLINE_MODE_V1_WIRING_PATHS,
} from "@/lib/pos/pos-offline-mode-v1-policy";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";

export type PosOfflineModeV1AuditSummary = {
  policyId: typeof POS_OFFLINE_MODE_V1_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  localCartWired: boolean;
  auditActionsRegistered: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  legacyDocLinked: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditPosOfflineModeV1(root = process.cwd()): PosOfflineModeV1AuditSummary {
  const wiringComplete = POS_OFFLINE_MODE_V1_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let localCartWired = false;
  let auditActionsRegistered = false;
  let allTestIdsPresent = false;
  let legacyDocLinked = false;

  if (existsSync(join(root, POS_OFFLINE_MODE_V1_DOC))) {
    const source = readFileSync(join(root, POS_OFFLINE_MODE_V1_DOC), "utf8");
    docWired =
      source.includes(POS_OFFLINE_MODE_V1_ROUTE) &&
      source.includes(String(POS_OFFLINE_MODE_V1_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, POS_OFFLINE_MODE_V1_COMPONENT))) {
    const source = readFileSync(join(root, POS_OFFLINE_MODE_V1_COMPONENT), "utf8");
    componentWired =
      source.includes("PosOfflineModeV1Panel") &&
      source.includes("POS_OFFLINE_MODE_V1_CAPABILITIES");
    allTestIdsPresent =
      source.includes("POS_OFFLINE_MODE_V1_TEST_IDS[0]") &&
      source.includes("POS_OFFLINE_MODE_V1_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, POS_OFFLINE_MODE_V1_PAGE))) {
    const source = readFileSync(join(root, POS_OFFLINE_MODE_V1_PAGE), "utf8");
    pageWired =
      source.includes("PosOfflineModeV1Panel") &&
      source.includes("POS_OFFLINE_MODE_V1_POLICY_ID");
  }

  if (existsSync(join(root, POS_OFFLINE_MODE_V1_LOCAL_CART_PATH))) {
    const source = readFileSync(join(root, POS_OFFLINE_MODE_V1_LOCAL_CART_PATH), "utf8");
    localCartWired =
      source.includes("savePosLocalCart") &&
      source.includes("loadPosLocalCart") &&
      source.includes("sessionStorage");
  }

  const auditActionsPath = "lib/audit/audit-actions.ts";
  if (existsSync(join(root, auditActionsPath))) {
    const source = readFileSync(join(root, auditActionsPath), "utf8");
    auditActionsRegistered =
      source.includes(AUDIT_ACTIONS.POS_OFFLINE_SALE_QUEUED) &&
      source.includes(AUDIT_ACTIONS.POS_OFFLINE_SYNC_COMPLETED) &&
      source.includes(AUDIT_ACTIONS.POS_OFFLINE_SYNC_CONFLICT);
  }

  const legacyPath = "docs/POS_OFFLINE_MODE.md";
  if (existsSync(join(root, legacyPath))) {
    const source = readFileSync(join(root, legacyPath), "utf8");
    legacyDocLinked =
      source.includes("pos-offline-mode-v1") || source.includes(POS_OFFLINE_MODE_V1_ROUTE);
  }

  const combinedSources = [
    POS_OFFLINE_MODE_V1_DOC,
    POS_OFFLINE_MODE_V1_COMPONENT,
    "lib/pos/pos-offline-mode-v1-content.ts",
    "services/pos/pos-offline-audit-service.ts",
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = POS_OFFLINE_MODE_V1_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    POS_OFFLINE_MODE_V1_CAPABILITIES.length === POS_OFFLINE_MODE_V1_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    localCartWired &&
    auditActionsRegistered &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    legacyDocLinked &&
    honestyMarkersPresent;

  return {
    policyId: POS_OFFLINE_MODE_V1_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    localCartWired,
    auditActionsRegistered,
    capabilityCountCorrect,
    allTestIdsPresent,
    legacyDocLinked,
    honestyMarkersPresent,
    passed,
  };
}

export function formatPosOfflineModeV1AuditLines(summary: PosOfflineModeV1AuditSummary): string[] {
  return [
    `POS offline mode v1 audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${POS_OFFLINE_MODE_V1_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${POS_OFFLINE_MODE_V1_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Local cart: ${summary.localCartWired ? "yes" : "no"}`,
    `Audit actions: ${summary.auditActionsRegistered ? "yes" : "no"}`,
    `Capabilities (${POS_OFFLINE_MODE_V1_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Legacy doc linked: ${summary.legacyDocLinked ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
