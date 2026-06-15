import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SOC2_ROADMAP_DOC_PATH,
  SOC2_ROADMAP_GAP_AREAS,
  SOC2_ROADMAP_HONESTY_MARKERS,
  SOC2_ROADMAP_REQUIRED_HEADINGS,
  SOC2_ROADMAP_TIMELINE_PHASES,
  SOC2_ROADMAP_WIRING_PATHS,
} from "@/lib/compliance/soc2-roadmap-absolute-final-policy";

export type Soc2RoadmapDocAudit = {
  ok: boolean;
  missingHeadings: string[];
  phaseCount: number;
  gapAreaCount: number;
  failures: string[];
};

export function auditSoc2RoadmapDoc(source: string): Omit<Soc2RoadmapDocAudit, "failures" | "ok"> {
  const missingHeadings = SOC2_ROADMAP_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const phaseCount = SOC2_ROADMAP_TIMELINE_PHASES.filter((phase) => source.includes(phase)).length;
  const gapAreaCount = SOC2_ROADMAP_GAP_AREAS.filter((area) => source.includes(area)).length;

  return { missingHeadings, phaseCount, gapAreaCount };
}

export function auditSoc2RoadmapWiring(root = process.cwd()): Soc2RoadmapDocAudit {
  const failures: string[] = [];

  for (const rel of SOC2_ROADMAP_WIRING_PATHS) {
    try {
      readFileSync(join(root, rel), "utf8");
    } catch {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const doc = readFileSync(join(root, SOC2_ROADMAP_DOC_PATH), "utf8");
  const docAudit = auditSoc2RoadmapDoc(doc);

  if (docAudit.missingHeadings.length > 0) {
    failures.push(`missing headings: ${docAudit.missingHeadings.join(", ")}`);
  }
  if (docAudit.phaseCount !== SOC2_ROADMAP_TIMELINE_PHASES.length) {
    failures.push(`expected ${SOC2_ROADMAP_TIMELINE_PHASES.length} timeline phases`);
  }
  if (docAudit.gapAreaCount !== SOC2_ROADMAP_GAP_AREAS.length) {
    failures.push(`expected ${SOC2_ROADMAP_GAP_AREAS.length} gap analysis areas`);
  }

  for (const marker of SOC2_ROADMAP_HONESTY_MARKERS) {
    if (!doc.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!doc.includes("soc2-roadmap-absolute-final-v1")) {
    failures.push("roadmap doc missing absolute final policy id");
  }

  return {
    ok: failures.length === 0,
    failures,
    ...docAudit,
  };
}
