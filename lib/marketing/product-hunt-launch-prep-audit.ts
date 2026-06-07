import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PRODUCT_HUNT_LAUNCH_DEFER_DOC,
  PRODUCT_HUNT_LAUNCH_PREP_DOC,
  PRODUCT_HUNT_LAUNCH_PREP_FORBIDDEN_CLAIMS,
  PRODUCT_HUNT_LAUNCH_PREP_HONESTY_MARKERS,
  PRODUCT_HUNT_LAUNCH_PREP_REQUIRED_HEADINGS,
  PRODUCT_HUNT_LAUNCH_PREP_REQUIRED_SECTIONS,
  PRODUCT_HUNT_LAUNCH_PREP_WIRING_PATHS,
} from "@/lib/marketing/product-hunt-launch-prep-absolute-final-policy";

export type ProductHuntLaunchPrepAudit = {
  ok: boolean;
  failures: string[];
  sectionCount: number;
};

export function auditProductHuntLaunchPrepDoc(source: string): {
  missingSections: string[];
  missingHeadings: string[];
  sectionCount: number;
} {
  const missingSections = PRODUCT_HUNT_LAUNCH_PREP_REQUIRED_SECTIONS.filter(
    (section) => !source.includes(section),
  );
  const missingHeadings = PRODUCT_HUNT_LAUNCH_PREP_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const sectionCount =
    PRODUCT_HUNT_LAUNCH_PREP_REQUIRED_SECTIONS.length - missingSections.length;

  return { missingSections, missingHeadings, sectionCount };
}

export function auditProductHuntLaunchPrepWiring(
  root = process.cwd(),
): ProductHuntLaunchPrepAudit {
  const failures: string[] = [];

  for (const rel of PRODUCT_HUNT_LAUNCH_PREP_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const prepDoc = readFileSync(join(root, PRODUCT_HUNT_LAUNCH_PREP_DOC), "utf8");
  const docAudit = auditProductHuntLaunchPrepDoc(prepDoc);

  if (docAudit.missingSections.length > 0) {
    failures.push(`missing sections: ${docAudit.missingSections.join(", ")}`);
  }
  if (docAudit.missingHeadings.length > 0) {
    failures.push(`missing headings: ${docAudit.missingHeadings.join(", ")}`);
  }

  for (const marker of PRODUCT_HUNT_LAUNCH_PREP_HONESTY_MARKERS) {
    if (!prepDoc.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!prepDoc.includes("product-hunt-launch-prep-absolute-final-v1")) {
    failures.push("prep doc missing absolute final policy id");
  }

  for (const claim of PRODUCT_HUNT_LAUNCH_PREP_FORBIDDEN_CLAIMS) {
    if (!prepDoc.includes(claim)) {
      failures.push(`prep doc missing forbidden claim reference: ${claim}`);
    }
  }

  const deferDoc = readFileSync(join(root, PRODUCT_HUNT_LAUNCH_DEFER_DOC), "utf8");
  if (!deferDoc.includes("product-hunt-launch-prep.md")) {
    failures.push("defer doc missing link to launch prep");
  }

  if (!prepDoc.includes("artifacts/product-hunt-launch/")) {
    failures.push("prep doc missing archive folder reference");
  }

  return {
    ok: failures.length === 0,
    failures,
    sectionCount: docAudit.sectionCount,
  };
}
