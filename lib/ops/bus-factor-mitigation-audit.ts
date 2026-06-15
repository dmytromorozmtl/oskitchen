import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  BUS_FACTOR_ADR_FILES,
  BUS_FACTOR_ADR_README_PATH,
  BUS_FACTOR_ENGINEERING_ONBOARDING_DOC,
  BUS_FACTOR_MITIGATION_DOC_PATH,
  BUS_FACTOR_ONBOARDING_REQUIRED_HEADINGS,
  BUS_FACTOR_SCORECARD_TARGETS,
  BUS_FACTOR_VIDEO_REQUIRED_HEADINGS,
  BUS_FACTOR_VIDEO_WALKTHROUGH_DOC,
  BUS_FACTOR_MITIGATION_WIRING_PATHS,
} from "@/lib/ops/bus-factor-mitigation-absolute-final-policy";

export type BusFactorMitigationAudit = {
  ok: boolean;
  failures: string[];
  adrCount: number;
};

export function auditBusFactorMitigationWiring(root = process.cwd()): BusFactorMitigationAudit {
  const failures: string[] = [];

  for (const rel of BUS_FACTOR_MITIGATION_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const onboarding = readFileSync(join(root, BUS_FACTOR_ENGINEERING_ONBOARDING_DOC), "utf8");
  for (const heading of BUS_FACTOR_ONBOARDING_REQUIRED_HEADINGS) {
    if (!onboarding.includes(heading)) {
      failures.push(`engineering-onboarding.md missing: ${heading}`);
    }
  }

  const video = readFileSync(join(root, BUS_FACTOR_VIDEO_WALKTHROUGH_DOC), "utf8");
  for (const heading of BUS_FACTOR_VIDEO_REQUIRED_HEADINGS) {
    if (!video.includes(heading)) {
      failures.push(`engineering-video-walkthrough.md missing: ${heading}`);
    }
  }

  const mitigation = readFileSync(join(root, BUS_FACTOR_MITIGATION_DOC_PATH), "utf8");
  if (!mitigation.includes("bus-factor-mitigation-absolute-final-v1")) {
    failures.push("bus-factor-mitigation.md missing absolute final policy id");
  }
  if (!mitigation.includes("engineering-onboarding.md")) {
    failures.push("bus-factor-mitigation.md missing onboarding doc link");
  }
  if (!mitigation.includes("engineering-video-walkthrough.md")) {
    failures.push("bus-factor-mitigation.md missing video walkthrough link");
  }

  const adrReadme = readFileSync(join(root, BUS_FACTOR_ADR_README_PATH), "utf8");
  for (const adr of BUS_FACTOR_ADR_FILES) {
    const basename = adr.replace("docs/adr/", "");
    if (!adrReadme.includes(basename.replace(".md", ""))) {
      failures.push(`adr/README.md missing entry for ${basename}`);
    }
  }

  const adrCount = BUS_FACTOR_ADR_FILES.length;
  if (adrCount < BUS_FACTOR_SCORECARD_TARGETS.minAdrCount) {
    failures.push(`expected at least ${BUS_FACTOR_SCORECARD_TARGETS.minAdrCount} ADRs`);
  }

  return { ok: failures.length === 0, failures, adrCount };
}
