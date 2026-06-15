/**
 * Validates human-written era25 charter docs against required section checklist.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ERA25_CHARTER_REQUIRED_SECTIONS,
  type Era25CharterRequiredSectionDef,
} from "@/lib/commercial/era25-first-charter-slice-readiness-phases-era24";
import { discoverEra25CharterDocs } from "@/lib/commercial/evaluate-era25-charter-exit-outside-linear-path";

export type Era25CharterSectionValidation = {
  sectionId: string;
  label: string;
  present: boolean;
};

export function validateEra25CharterDocSections(
  content: string,
  sections: readonly Era25CharterRequiredSectionDef[] = ERA25_CHARTER_REQUIRED_SECTIONS,
): {
  sectionsValid: boolean;
  sectionResults: readonly Era25CharterSectionValidation[];
  missingSectionIds: readonly string[];
  missingSectionLabels: readonly string[];
} {
  const sectionResults = sections.map((section) => ({
    sectionId: section.id,
    label: section.label,
    present: section.pattern.test(content),
  }));

  const missing = sectionResults.filter((result) => !result.present);

  return {
    sectionsValid: missing.length === 0,
    sectionResults,
    missingSectionIds: missing.map((result) => result.sectionId),
    missingSectionLabels: missing.map((result) => result.label),
  };
}

export function validateFirstEra25CharterDocSections(
  root: string = process.cwd(),
): {
  charterDocPath: string | null;
  sectionsValid: boolean;
  sectionResults: readonly Era25CharterSectionValidation[];
  missingSectionIds: readonly string[];
  missingSectionLabels: readonly string[];
} {
  const docs = discoverEra25CharterDocs(root);
  if (docs.length === 0) {
    return {
      charterDocPath: null,
      sectionsValid: false,
      sectionResults: ERA25_CHARTER_REQUIRED_SECTIONS.map((section) => ({
        sectionId: section.id,
        label: section.label,
        present: false,
      })),
      missingSectionIds: ERA25_CHARTER_REQUIRED_SECTIONS.map((section) => section.id),
      missingSectionLabels: ERA25_CHARTER_REQUIRED_SECTIONS.map((section) => section.label),
    };
  }

  const charterDocPath = docs[0] ?? null;
  if (!charterDocPath) {
    return {
      charterDocPath: null,
      sectionsValid: false,
      sectionResults: [],
      missingSectionIds: [],
      missingSectionLabels: [],
    };
  }

  const content = readFileSync(join(root, charterDocPath), "utf8");
  const validation = validateEra25CharterDocSections(content);

  return {
    charterDocPath,
    ...validation,
  };
}
