import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FREE_PILOT_TIER_FORBIDDEN_CLAIMS,
  FREE_PILOT_TIER_HONESTY_MARKERS,
  FREE_PILOT_TIER_MAX_SLOTS,
  FREE_PILOT_TIER_PROGRAM_DOC,
  FREE_PILOT_TIER_REQUIRED_HEADINGS,
  FREE_PILOT_TIER_REQUIRED_SECTIONS,
  FREE_PILOT_TIER_TERM_DAYS,
  FREE_PILOT_TIER_WIRING_PATHS,
} from "@/lib/commercial/free-pilot-tier-program-absolute-final-policy";

export type FreePilotTierProgramAudit = {
  ok: boolean;
  failures: string[];
  sectionCount: number;
};

export function auditFreePilotTierProgramDoc(source: string): {
  missingSections: string[];
  missingHeadings: string[];
  sectionCount: number;
} {
  const missingSections = FREE_PILOT_TIER_REQUIRED_SECTIONS.filter(
    (section) => !source.includes(section),
  );
  const missingHeadings = FREE_PILOT_TIER_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const sectionCount =
    FREE_PILOT_TIER_REQUIRED_SECTIONS.length - missingSections.length;

  return { missingSections, missingHeadings, sectionCount };
}

export function auditFreePilotTierProgramWiring(root = process.cwd()): FreePilotTierProgramAudit {
  const failures: string[] = [];

  for (const rel of FREE_PILOT_TIER_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const doc = readFileSync(join(root, FREE_PILOT_TIER_PROGRAM_DOC), "utf8");
  const docAudit = auditFreePilotTierProgramDoc(doc);

  if (docAudit.missingSections.length > 0) {
    failures.push(`missing sections: ${docAudit.missingSections.join(", ")}`);
  }
  if (docAudit.missingHeadings.length > 0) {
    failures.push(`missing headings: ${docAudit.missingHeadings.join(", ")}`);
  }

  for (const marker of FREE_PILOT_TIER_HONESTY_MARKERS) {
    if (!doc.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!doc.includes("free-pilot-tier-program-absolute-final-v1")) {
    failures.push("program doc missing absolute final policy id");
  }

  if (!doc.includes(String(FREE_PILOT_TIER_MAX_SLOTS))) {
    failures.push(`program doc missing max slots ${FREE_PILOT_TIER_MAX_SLOTS}`);
  }

  if (!doc.includes(String(FREE_PILOT_TIER_TERM_DAYS))) {
    failures.push(`program doc missing ${FREE_PILOT_TIER_TERM_DAYS}-day term`);
  }

  for (const claim of FREE_PILOT_TIER_FORBIDDEN_CLAIMS) {
    if (!doc.includes(claim)) {
      failures.push(`program doc missing forbidden claim reference: ${claim}`);
    }
  }

  const loiDoc = readFileSync(join(root, "docs/loi-signed.md"), "utf8");
  if (!loiDoc.includes("free-pilot-tier-program.md")) {
    failures.push("loi-signed.md missing link to free pilot tier program");
  }

  return {
    ok: failures.length === 0,
    failures,
    sectionCount: docAudit.sectionCount,
  };
}
