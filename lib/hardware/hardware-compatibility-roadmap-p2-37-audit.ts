import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_BLUETOOTH_PRINTERS,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_DISCLAIMER,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_IPAD_MOUNTS,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ITEMS,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_USB_PRINTERS,
  assertHardwareCompatibilityRoadmapP2_37ItemCount,
} from "@/lib/hardware/hardware-compatibility-roadmap-p2-37-content";
import {
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ARTIFACT,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_COMPETITOR,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_DOC,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_HEADLINE,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_HONESTY_MARKERS,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_POLICY_ID,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_POSITIONING_LINE,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_RELATED_DOCS,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ROADMAP_ITEM_COUNT,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ROADMAP_ITEM_IDS,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_WIRING_PATHS,
} from "@/lib/hardware/hardware-compatibility-roadmap-p2-37-policy";

export type HardwareCompatibilityRoadmapP2_37AuditSummary = {
  policyId: typeof HARDWARE_COMPATIBILITY_ROADMAP_P2_37_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryPresent: boolean;
  usbPrintersDocumented: boolean;
  bluetoothPrintersDocumented: boolean;
  ipadMountsDocumented: boolean;
  roadmapItemsDocumented: boolean;
  honestyMarkersPresent: boolean;
  itemCountCorrect: boolean;
  passed: boolean;
};

export function auditHardwareCompatibilityRoadmapP2_37(
  root = process.cwd(),
): HardwareCompatibilityRoadmapP2_37AuditSummary {
  const wiringComplete = HARDWARE_COMPATIBILITY_ROADMAP_P2_37_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let usbPrintersDocumented = false;
  let bluetoothPrintersDocumented = false;
  let ipadMountsDocumented = false;
  let roadmapItemsDocumented = false;

  if (existsSync(join(root, HARDWARE_COMPATIBILITY_ROADMAP_P2_37_DOC))) {
    const source = readFileSync(join(root, HARDWARE_COMPATIBILITY_ROADMAP_P2_37_DOC), "utf8");
    docWired =
      source.includes(HARDWARE_COMPATIBILITY_ROADMAP_P2_37_DISCLAIMER) &&
      source.includes(HARDWARE_COMPATIBILITY_ROADMAP_P2_37_HEADLINE) &&
      source.includes(HARDWARE_COMPATIBILITY_ROADMAP_P2_37_POSITIONING_LINE) &&
      HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ROADMAP_ITEM_IDS.every((id) => source.includes(id));

    usbPrintersDocumented = HARDWARE_COMPATIBILITY_ROADMAP_P2_37_USB_PRINTERS.every(
      (p) => source.includes(p.model),
    );
    bluetoothPrintersDocumented = HARDWARE_COMPATIBILITY_ROADMAP_P2_37_BLUETOOTH_PRINTERS.every(
      (p) => source.includes(p.model),
    );
    ipadMountsDocumented = HARDWARE_COMPATIBILITY_ROADMAP_P2_37_IPAD_MOUNTS.filter(
      (m) => m.tier !== "not_supported",
    ).every((m) => source.includes(m.vendor));
    roadmapItemsDocumented = HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ITEMS.every((item) =>
      source.includes(item.id),
    );
  }

  const registryPresent = existsSync(join(root, HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ARTIFACT));

  const combined = [
    HARDWARE_COMPATIBILITY_ROADMAP_P2_37_DOC,
    "lib/hardware/hardware-compatibility-roadmap-p2-37-content.ts",
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = HARDWARE_COMPATIBILITY_ROADMAP_P2_37_HONESTY_MARKERS.every(
    (marker) => combined.toLowerCase().includes(marker.toLowerCase()),
  );

  const relatedDocsReferenced = HARDWARE_COMPATIBILITY_ROADMAP_P2_37_RELATED_DOCS.filter((rel) =>
    existsSync(join(root, rel)),
  ).every((rel) => combined.includes(rel.split("/").pop() ?? rel));

  const itemCountCorrect =
    assertHardwareCompatibilityRoadmapP2_37ItemCount() &&
    HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ITEMS.length ===
      HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ROADMAP_ITEM_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    registryPresent &&
    usbPrintersDocumented &&
    bluetoothPrintersDocumented &&
    ipadMountsDocumented &&
    roadmapItemsDocumented &&
    honestyMarkersPresent &&
    relatedDocsReferenced &&
    itemCountCorrect;

  return {
    policyId: HARDWARE_COMPATIBILITY_ROADMAP_P2_37_POLICY_ID,
    wiringComplete,
    docWired,
    registryPresent,
    usbPrintersDocumented,
    bluetoothPrintersDocumented,
    ipadMountsDocumented,
    roadmapItemsDocumented,
    honestyMarkersPresent,
    itemCountCorrect,
    passed,
  };
}

export function formatHardwareCompatibilityRoadmapP2_37AuditLines(
  summary: HardwareCompatibilityRoadmapP2_37AuditSummary,
): string[] {
  return [
    `Hardware compatibility roadmap audit (${summary.policyId})`,
    `Competitor: ${HARDWARE_COMPATIBILITY_ROADMAP_P2_37_COMPETITOR}`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${HARDWARE_COMPATIBILITY_ROADMAP_P2_37_DOC})`,
    `Registry artifact: ${summary.registryPresent ? "present" : "missing"}`,
    `USB printers documented: ${summary.usbPrintersDocumented ? "yes" : "no"}`,
    `Bluetooth printers documented: ${summary.bluetoothPrintersDocumented ? "yes" : "no"}`,
    `iPad mounts documented: ${summary.ipadMountsDocumented ? "yes" : "no"}`,
    `Roadmap items (${HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ROADMAP_ITEM_COUNT}): ${summary.roadmapItemsDocumented ? "yes" : "no"}`,
    `Item count correct: ${summary.itemCountCorrect ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
