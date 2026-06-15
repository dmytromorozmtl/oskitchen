import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  checkNativeTabletUxP2_95BaselineAudit,
  checkNativeTabletUxTouchbistroLiveWiring,
  loadNativeTabletUxTouchbistroRegistry,
  validateNativeTabletUxTouchbistroRegistry,
} from "@/lib/design/native-tablet-ux-p3-145-operations";
import {
  NATIVE_TABLET_UX_P3_145_ARTIFACT,
  NATIVE_TABLET_UX_P3_145_CAPABILITY_COUNT,
  NATIVE_TABLET_UX_P3_145_CAPABILITY_IDS,
  NATIVE_TABLET_UX_P3_145_COMPETITOR,
  NATIVE_TABLET_UX_P3_145_DOC,
  NATIVE_TABLET_UX_P3_145_HEADLINE,
  NATIVE_TABLET_UX_P3_145_HONESTY_MARKERS,
  NATIVE_TABLET_UX_P3_145_IMPLEMENTATION_REF,
  NATIVE_TABLET_UX_P3_145_MIN_TOUCH_PX,
  NATIVE_TABLET_UX_P3_145_POLICY_ID,
  NATIVE_TABLET_UX_P3_145_RELATED_DOCS,
  NATIVE_TABLET_UX_P3_145_ROUTE,
  NATIVE_TABLET_UX_P3_145_WIRING_PATHS,
} from "@/lib/design/native-tablet-ux-p3-145-policy";

export type NativeTabletUxP3_145AuditSummary = {
  policyId: typeof NATIVE_TABLET_UX_P3_145_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  p2BaselineAuditPassed: boolean;
  liveTouchbistroWiringPassed: boolean;
  relatedDocsReferenced: boolean;
  capabilitiesDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditNativeTabletUxP3_145(root = process.cwd()): NativeTabletUxP3_145AuditSummary {
  const wiringComplete = NATIVE_TABLET_UX_P3_145_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let capabilitiesDocumented = false;

  if (existsSync(join(root, NATIVE_TABLET_UX_P3_145_DOC))) {
    const source = readFileSync(join(root, NATIVE_TABLET_UX_P3_145_DOC), "utf8");
    docWired =
      source.includes(NATIVE_TABLET_UX_P3_145_HEADLINE) &&
      source.includes(NATIVE_TABLET_UX_P3_145_COMPETITOR) &&
      source.includes(NATIVE_TABLET_UX_P3_145_IMPLEMENTATION_REF) &&
      source.includes(String(NATIVE_TABLET_UX_P3_145_MIN_TOUCH_PX)) &&
      source.includes(String(NATIVE_TABLET_UX_P3_145_CAPABILITY_COUNT)) &&
      source.includes(NATIVE_TABLET_UX_P3_145_ROUTE);
    relatedDocsReferenced = NATIVE_TABLET_UX_P3_145_RELATED_DOCS.every((doc) => {
      const basename = doc.split("/").pop() ?? doc;
      return source.includes(basename);
    });
    capabilitiesDocumented = NATIVE_TABLET_UX_P3_145_CAPABILITY_IDS.every((capabilityId) =>
      source.includes(capabilityId),
    );
  }

  let registryValid = false;
  if (existsSync(join(root, NATIVE_TABLET_UX_P3_145_ARTIFACT))) {
    const registry = loadNativeTabletUxTouchbistroRegistry(root);
    registryValid = validateNativeTabletUxTouchbistroRegistry(registry).valid;
  }

  const p2BaselineAuditPassed = checkNativeTabletUxP2_95BaselineAudit(root);
  const liveTouchbistroWiringPassed = checkNativeTabletUxTouchbistroLiveWiring(root);

  const combinedSources = [NATIVE_TABLET_UX_P3_145_DOC, NATIVE_TABLET_UX_P3_145_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = NATIVE_TABLET_UX_P3_145_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    p2BaselineAuditPassed &&
    liveTouchbistroWiringPassed &&
    relatedDocsReferenced &&
    capabilitiesDocumented &&
    honestyMarkersPresent;

  return {
    policyId: NATIVE_TABLET_UX_P3_145_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    p2BaselineAuditPassed,
    liveTouchbistroWiringPassed,
    relatedDocsReferenced,
    capabilitiesDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatNativeTabletUxP3_145AuditLines(
  summary: NativeTabletUxP3_145AuditSummary,
): string[] {
  return [
    `Native tablet UX TouchBistro audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${NATIVE_TABLET_UX_P3_145_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `P2-95 baseline audit: ${summary.p2BaselineAuditPassed ? "PASS" : "FAIL"}`,
    `Live TouchBistro design hub: ${summary.liveTouchbistroWiringPassed ? "PASS" : "FAIL"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `3 capabilities documented: ${summary.capabilitiesDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
