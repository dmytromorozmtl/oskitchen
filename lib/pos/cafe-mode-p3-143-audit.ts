import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  checkCafeModeLiveTerminalWiring,
  loadCafeModePosRegistry,
  validateCafeModePosRegistry,
} from "@/lib/pos/cafe-mode-p3-143-operations";
import {
  CAFE_MODE_P3_143_ARTIFACT,
  CAFE_MODE_P3_143_COMPETITOR,
  CAFE_MODE_P3_143_DOC,
  CAFE_MODE_P3_143_HEADLINE,
  CAFE_MODE_P3_143_HONESTY_MARKERS,
  CAFE_MODE_P3_143_MAX_SCREENS,
  CAFE_MODE_P3_143_POLICY_ID,
  CAFE_MODE_P3_143_RELATED_DOCS,
  CAFE_MODE_P3_143_ROUTE,
  CAFE_MODE_P3_143_SCREEN_IDS,
  CAFE_MODE_P3_143_WIRING_PATHS,
} from "@/lib/pos/cafe-mode-p3-143-policy";

export type CafeModeP3_143AuditSummary = {
  policyId: typeof CAFE_MODE_P3_143_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  liveTerminalWiringPassed: boolean;
  relatedDocsReferenced: boolean;
  screensDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditCafeModeP3_143(root = process.cwd()): CafeModeP3_143AuditSummary {
  const wiringComplete = CAFE_MODE_P3_143_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let screensDocumented = false;

  if (existsSync(join(root, CAFE_MODE_P3_143_DOC))) {
    const source = readFileSync(join(root, CAFE_MODE_P3_143_DOC), "utf8");
    docWired =
      source.includes(CAFE_MODE_P3_143_HEADLINE) &&
      source.includes(CAFE_MODE_P3_143_COMPETITOR) &&
      source.includes(String(CAFE_MODE_P3_143_MAX_SCREENS)) &&
      source.includes("5-screen max") &&
      source.includes(CAFE_MODE_P3_143_ROUTE);
    relatedDocsReferenced = CAFE_MODE_P3_143_RELATED_DOCS.every((doc) => {
      const basename = doc.split("/").pop() ?? doc;
      return source.includes(basename);
    });
    screensDocumented = CAFE_MODE_P3_143_SCREEN_IDS.every((screenId) =>
      source.includes(screenId),
    );
  }

  let registryValid = false;
  if (existsSync(join(root, CAFE_MODE_P3_143_ARTIFACT))) {
    const registry = loadCafeModePosRegistry(root);
    registryValid = validateCafeModePosRegistry(registry).valid;
  }

  const liveTerminalWiringPassed = checkCafeModeLiveTerminalWiring(root);

  const combinedSources = [CAFE_MODE_P3_143_DOC, CAFE_MODE_P3_143_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = CAFE_MODE_P3_143_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    liveTerminalWiringPassed &&
    relatedDocsReferenced &&
    screensDocumented &&
    honestyMarkersPresent;

  return {
    policyId: CAFE_MODE_P3_143_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    liveTerminalWiringPassed,
    relatedDocsReferenced,
    screensDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatCafeModeP3_143AuditLines(summary: CafeModeP3_143AuditSummary): string[] {
  return [
    `Café mode POS audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${CAFE_MODE_P3_143_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `Live café terminal: ${summary.liveTerminalWiringPassed ? "PASS" : "FAIL"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `5 screens documented: ${summary.screensDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
