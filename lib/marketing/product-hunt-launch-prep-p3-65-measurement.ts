import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditProductHuntLaunchPrepWiring } from "@/lib/marketing/product-hunt-launch-prep-audit";
import {
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_ARCHIVE_DIR,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_PLAYBOOK_DOC,
  PRODUCT_HUNT_LAUNCH_PREP_P3_65_REQUIRED_TIMELINE,
} from "@/lib/marketing/product-hunt-launch-prep-p3-65-policy";

export type ProductHuntLaunchPrepContractValidation = {
  passed: boolean;
  upstreamAuditOk: boolean;
  archiveWired: boolean;
  listingDraftWired: boolean;
  timelineComplete: boolean;
  failures: string[];
};

export function validateProductHuntLaunchPrepContract(
  root = process.cwd(),
): ProductHuntLaunchPrepContractValidation {
  const failures: string[] = [];

  const playbookPath = join(root, PRODUCT_HUNT_LAUNCH_PREP_P3_65_PLAYBOOK_DOC);
  if (!existsSync(playbookPath)) {
    failures.push(`missing playbook: ${PRODUCT_HUNT_LAUNCH_PREP_P3_65_PLAYBOOK_DOC}`);
  }

  let timelineComplete = false;
  if (existsSync(playbookPath)) {
    const source = readFileSync(playbookPath, "utf8");
    const missingTimeline = PRODUCT_HUNT_LAUNCH_PREP_P3_65_REQUIRED_TIMELINE.filter(
      (heading) => !source.includes(heading),
    );
    timelineComplete = missingTimeline.length === 0;
    if (!timelineComplete) {
      failures.push(`playbook missing timeline headings: ${missingTimeline.join(", ")}`);
    }
  }

  const archiveReadme = join(root, PRODUCT_HUNT_LAUNCH_PREP_P3_65_ARCHIVE_DIR, "README.md");
  const listingDraft = join(root, PRODUCT_HUNT_LAUNCH_PREP_P3_65_ARCHIVE_DIR, "listing-draft.md");
  const archiveWired = existsSync(archiveReadme);
  const listingDraftWired = existsSync(listingDraft);

  if (!archiveWired) {
    failures.push(`missing archive readme: ${PRODUCT_HUNT_LAUNCH_PREP_P3_65_ARCHIVE_DIR}/README.md`);
  }
  if (!listingDraftWired) {
    failures.push(`missing listing draft: ${PRODUCT_HUNT_LAUNCH_PREP_P3_65_ARCHIVE_DIR}/listing-draft.md`);
  }

  const upstream = auditProductHuntLaunchPrepWiring(root);
  if (!upstream.ok) {
    failures.push(...upstream.failures);
  }

  return {
    passed: failures.length === 0 && upstream.ok,
    upstreamAuditOk: upstream.ok,
    archiveWired,
    listingDraftWired,
    timelineComplete,
    failures,
  };
}
