import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_COPY_ARTIFACT_PATHS,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_LISTING_COPY,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_PREP_CHECKLIST,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_REQUIRED_ASSETS,
  taglineWithinProductHuntLimit,
} from "@/lib/marketing/product-hunt-launch-prep-p2-60-content";
import {
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_DOC,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_HONESTY_MARKERS,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_PLAYBOOK_DOC,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_POLICY_ID,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_TIMELINE_HEADINGS,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_WIRING_PATHS,
} from "@/lib/marketing/product-hunt-launch-prep-p2-60-policy";

export type ProductHuntLaunchPrepP260AuditSummary = {
  policyId: typeof PRODUCT_HUNT_LAUNCH_PREP_P2_60_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  playbookWired: boolean;
  assetsDefined: boolean;
  copyArtifactsWired: boolean;
  copyValid: boolean;
  checklistComplete: boolean;
  deferLinked: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditProductHuntLaunchPrepP260(
  root = process.cwd(),
): ProductHuntLaunchPrepP260AuditSummary {
  const wiringComplete = PRODUCT_HUNT_LAUNCH_PREP_P2_60_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let deferLinked = false;
  let honestyMarkersPresent = false;

  if (existsSync(join(root, PRODUCT_HUNT_LAUNCH_PREP_P2_60_DOC))) {
    const source = readFileSync(join(root, PRODUCT_HUNT_LAUNCH_PREP_P2_60_DOC), "utf8");
    docWired =
      source.includes(PRODUCT_HUNT_LAUNCH_PREP_P2_60_POLICY_ID) &&
      source.includes("Asset checklist") &&
      source.includes("Listing copy");
    deferLinked = source.includes("product-hunt-launch-defer.md");
    honestyMarkersPresent = PRODUCT_HUNT_LAUNCH_PREP_P2_60_HONESTY_MARKERS.every((marker) =>
      source.toLowerCase().includes(marker.toLowerCase()),
    );
  }

  let playbookWired = false;
  if (existsSync(join(root, PRODUCT_HUNT_LAUNCH_PREP_P2_60_PLAYBOOK_DOC))) {
    const playbook = readFileSync(join(root, PRODUCT_HUNT_LAUNCH_PREP_P2_60_PLAYBOOK_DOC), "utf8");
    playbookWired = PRODUCT_HUNT_LAUNCH_PREP_P2_60_TIMELINE_HEADINGS.every((heading) =>
      playbook.includes(heading),
    );
  }

  const assetsDefined =
    PRODUCT_HUNT_LAUNCH_PREP_P2_60_REQUIRED_ASSETS.length >= 7 &&
    PRODUCT_HUNT_LAUNCH_PREP_P2_60_REQUIRED_ASSETS.some((a) => a.id === "hero-gif");

  const copyArtifactsWired = PRODUCT_HUNT_LAUNCH_PREP_P2_60_COPY_ARTIFACT_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let copyValid = false;
  if (copyArtifactsWired) {
    const listing = readFileSync(
      join(root, PRODUCT_HUNT_LAUNCH_PREP_P2_60_COPY_ARTIFACT_PATHS[0]!),
      "utf8",
    );
    copyValid =
      listing.includes(PRODUCT_HUNT_LAUNCH_PREP_P2_60_LISTING_COPY.tagline) &&
      taglineWithinProductHuntLimit(PRODUCT_HUNT_LAUNCH_PREP_P2_60_LISTING_COPY.tagline);
  }

  const checklistComplete = PRODUCT_HUNT_LAUNCH_PREP_P2_60_PREP_CHECKLIST.length >= 7;

  const passed =
    wiringComplete &&
    docWired &&
    playbookWired &&
    assetsDefined &&
    copyArtifactsWired &&
    copyValid &&
    checklistComplete &&
    deferLinked &&
    honestyMarkersPresent;

  return {
    policyId: PRODUCT_HUNT_LAUNCH_PREP_P2_60_POLICY_ID,
    wiringComplete,
    docWired,
    playbookWired,
    assetsDefined,
    copyArtifactsWired,
    copyValid,
    checklistComplete,
    deferLinked,
    honestyMarkersPresent,
    passed,
  };
}

export function formatProductHuntLaunchPrepP260AuditLines(
  summary: ProductHuntLaunchPrepP260AuditSummary,
): string[] {
  return [
    `Product Hunt launch prep (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Playbook timeline: ${summary.playbookWired ? "yes" : "no"}`,
    `Assets defined: ${summary.assetsDefined ? "yes" : "no"}`,
    `Copy artifacts: ${summary.copyArtifactsWired ? "yes" : "no"}`,
    `Copy valid: ${summary.copyValid ? "yes" : "no"}`,
    `Checklist: ${summary.checklistComplete ? "yes" : "no"}`,
    `Defer linked: ${summary.deferLinked ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
