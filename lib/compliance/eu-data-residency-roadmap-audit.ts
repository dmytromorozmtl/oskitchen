import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  EU_DATA_RESIDENCY_GAP_AREAS,
  EU_DATA_RESIDENCY_HONESTY_MARKERS,
  EU_DATA_RESIDENCY_REQUIRED_HEADINGS,
  EU_DATA_RESIDENCY_ROADMAP_DOC_PATH,
  EU_DATA_RESIDENCY_TIMELINE_PHASES,
  EU_DATA_RESIDENCY_WIRING_PATHS,
} from "@/lib/compliance/eu-data-residency-roadmap-absolute-final-policy";

export type EuDataResidencyRoadmapDocAudit = {
  ok: boolean;
  missingHeadings: string[];
  phaseCount: number;
  gapAreaCount: number;
  failures: string[];
};

export function auditEuDataResidencyRoadmapDoc(
  source: string,
): Omit<EuDataResidencyRoadmapDocAudit, "failures" | "ok"> {
  const missingHeadings = EU_DATA_RESIDENCY_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const phaseCount = EU_DATA_RESIDENCY_TIMELINE_PHASES.filter((phase) =>
    source.includes(phase),
  ).length;
  const gapAreaCount = EU_DATA_RESIDENCY_GAP_AREAS.filter((area) => source.includes(area)).length;

  return { missingHeadings, phaseCount, gapAreaCount };
}

export function auditEuDataResidencyRoadmapWiring(
  root = process.cwd(),
): EuDataResidencyRoadmapDocAudit {
  const failures: string[] = [];

  for (const rel of EU_DATA_RESIDENCY_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const doc = readFileSync(join(root, EU_DATA_RESIDENCY_ROADMAP_DOC_PATH), "utf8");
  const docAudit = auditEuDataResidencyRoadmapDoc(doc);

  if (docAudit.missingHeadings.length > 0) {
    failures.push(`missing headings: ${docAudit.missingHeadings.join(", ")}`);
  }
  if (docAudit.phaseCount !== EU_DATA_RESIDENCY_TIMELINE_PHASES.length) {
    failures.push(`expected ${EU_DATA_RESIDENCY_TIMELINE_PHASES.length} timeline phases`);
  }
  if (docAudit.gapAreaCount !== EU_DATA_RESIDENCY_GAP_AREAS.length) {
    failures.push(`expected ${EU_DATA_RESIDENCY_GAP_AREAS.length} gap analysis areas`);
  }

  for (const marker of EU_DATA_RESIDENCY_HONESTY_MARKERS) {
    if (!doc.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!doc.includes("eu-data-residency-roadmap-absolute-final-v1")) {
    failures.push("roadmap doc missing absolute final policy id");
  }

  const soc2Doc = readFileSync(join(root, "docs/soc2-roadmap-with-timeline.md"), "utf8");
  if (!soc2Doc.includes("eu-data-residency-roadmap.md")) {
    failures.push("soc2 roadmap missing link to EU data residency roadmap");
  }

  const trustReadiness = readFileSync(
    join(root, "docs/ENTERPRISE_TRUST_COMPLIANCE_READINESS.md"),
    "utf8",
  );
  if (!trustReadiness.includes("eu-data-residency-roadmap.md")) {
    failures.push("enterprise trust readiness missing EU residency roadmap link");
  }

  return {
    ok: failures.length === 0,
    failures,
    ...docAudit,
  };
}
