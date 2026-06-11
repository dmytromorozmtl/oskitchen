import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { CERTIFIED_HARDWARE_GUIDE_CATEGORIES } from "@/lib/hardware/certified-hardware-guide-content";
import {
  CERTIFIED_HARDWARE_GUIDE_CATEGORY_COUNT,
  CERTIFIED_HARDWARE_GUIDE_CATEGORY_IDS,
  CERTIFIED_HARDWARE_GUIDE_COMPAT_DOC,
  CERTIFIED_HARDWARE_GUIDE_DOC,
  CERTIFIED_HARDWARE_GUIDE_HONESTY_MARKERS,
  CERTIFIED_HARDWARE_GUIDE_POLICY_ID,
  CERTIFIED_HARDWARE_GUIDE_WIRING_PATHS,
} from "@/lib/hardware/certified-hardware-guide-policy";

const CERTIFIED_HARDWARE_GUIDE_HEADLINE =
  "Certified hardware guide — deploy OS Kitchen without proprietary terminals";

export type CertifiedHardwareGuideAuditSummary = {
  policyId: typeof CERTIFIED_HARDWARE_GUIDE_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  compatDocLinked: boolean;
  categoryCountCorrect: boolean;
  allCategoriesInDoc: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditCertifiedHardwareGuide(
  root = process.cwd(),
): CertifiedHardwareGuideAuditSummary {
  const wiringComplete = CERTIFIED_HARDWARE_GUIDE_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let compatDocLinked = false;
  let allCategoriesInDoc = false;

  if (existsSync(join(root, CERTIFIED_HARDWARE_GUIDE_DOC))) {
    const source = readFileSync(join(root, CERTIFIED_HARDWARE_GUIDE_DOC), "utf8");
    docWired =
      source.includes(CERTIFIED_HARDWARE_GUIDE_HEADLINE) &&
      source.includes("hardware-compatibility.md") &&
      source.includes(String(CERTIFIED_HARDWARE_GUIDE_CATEGORY_COUNT));
    allCategoriesInDoc = CERTIFIED_HARDWARE_GUIDE_CATEGORIES.every(
      (category) =>
        source.includes(category.label) && source.includes(`category-${category.id}`),
    );
  }

  if (existsSync(join(root, CERTIFIED_HARDWARE_GUIDE_COMPAT_DOC))) {
    const source = readFileSync(join(root, CERTIFIED_HARDWARE_GUIDE_COMPAT_DOC), "utf8");
    compatDocLinked = source.includes("certified-hardware-guide.md");
  }

  const combinedSources = [
    CERTIFIED_HARDWARE_GUIDE_DOC,
    CERTIFIED_HARDWARE_GUIDE_COMPAT_DOC,
    "lib/hardware/certified-hardware-guide-content.ts",
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = CERTIFIED_HARDWARE_GUIDE_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const categoryCountCorrect =
    CERTIFIED_HARDWARE_GUIDE_CATEGORY_IDS.length === CERTIFIED_HARDWARE_GUIDE_CATEGORY_COUNT &&
    CERTIFIED_HARDWARE_GUIDE_CATEGORIES.length === CERTIFIED_HARDWARE_GUIDE_CATEGORY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    compatDocLinked &&
    categoryCountCorrect &&
    allCategoriesInDoc &&
    honestyMarkersPresent;

  return {
    policyId: CERTIFIED_HARDWARE_GUIDE_POLICY_ID,
    wiringComplete,
    docWired,
    compatDocLinked,
    categoryCountCorrect,
    allCategoriesInDoc,
    honestyMarkersPresent,
    passed,
  };
}

export function formatCertifiedHardwareGuideAuditLines(
  summary: CertifiedHardwareGuideAuditSummary,
): string[] {
  return [
    `Certified hardware guide audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${CERTIFIED_HARDWARE_GUIDE_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Compat doc linked: ${summary.compatDocLinked ? "yes" : "no"}`,
    `Categories (${CERTIFIED_HARDWARE_GUIDE_CATEGORY_COUNT}): ${summary.categoryCountCorrect ? "yes" : "no"}`,
    `All categories in doc: ${summary.allCategoriesInDoc ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
