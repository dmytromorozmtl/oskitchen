import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { EU_DATA_RESIDENCY_ROADMAP_DOC_PATH } from "@/lib/compliance/eu-data-residency-roadmap-absolute-final-policy";
import {
  EU_DATA_RESIDENCY_GTM_SCALE_DOC_PATH,
  EU_DATA_RESIDENCY_GTM_SCALE_HONESTY_MARKERS,
  EU_DATA_RESIDENCY_GTM_SCALE_WIRING_PATHS,
} from "@/lib/marketing/eu-data-residency-gtm-scale-absolute-final-policy";

export type EuDataResidencyGtmScaleAudit = {
  ok: boolean;
  failures: string[];
};

export function auditEuDataResidencyGtmScaleWiring(
  root = process.cwd(),
): EuDataResidencyGtmScaleAudit {
  const failures: string[] = [];

  for (const rel of EU_DATA_RESIDENCY_GTM_SCALE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const docSource = readFileSync(join(root, EU_DATA_RESIDENCY_GTM_SCALE_DOC_PATH), "utf8");
  const roadmapSource = readFileSync(join(root, EU_DATA_RESIDENCY_ROADMAP_DOC_PATH), "utf8");

  for (const marker of EU_DATA_RESIDENCY_GTM_SCALE_HONESTY_MARKERS) {
    if (!docSource.includes(marker)) {
      failures.push(`doc missing honesty marker: ${marker}`);
    }
  }

  if (!docSource.includes(EU_DATA_RESIDENCY_ROADMAP_DOC_PATH)) {
    failures.push("doc missing roadmap doc link");
  }

  if (!docSource.includes("/trust")) {
    failures.push("doc missing /trust link");
  }

  if (!roadmapSource.includes("eu-data-residency-roadmap-absolute-final-v1")) {
    failures.push("roadmap missing feature policy id");
  }

  if (!docSource.includes("eu-data-residency-gtm-scale-absolute-final-v1")) {
    failures.push("doc missing GTM policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
