/**
 * Validates era25 first product slice staging proof checklist doc sections.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_DOC,
} from "@/lib/commercial/era25-first-product-slice-blueprint-phases-era24";

export type Era25StagingChecklistSectionDef = {
  id: string;
  label: string;
  pattern: RegExp;
};

export const ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_SECTIONS: readonly Era25StagingChecklistSectionDef[] =
  [
    { id: "purpose", label: "Purpose", pattern: /##\s*Purpose/i },
    { id: "p0_vault", label: "P0 ops vault (11 env vars)", pattern: /11\s+env\s+var|P0\s+ops\s+vault/i },
    { id: "staging_smokes", label: "Staging smoke commands", pattern: /npm run smoke:/i },
    { id: "cert_chain", label: "CI cert chain", pattern: /test:ci:/i },
    { id: "rollback_nogo", label: "Rollback / NO-GO", pattern: /NO-GO|rollback/i },
    { id: "leadership_signoff", label: "Leadership sign-off", pattern: /sign-off|signoff/i },
  ] as const;

export type Era25StagingChecklistSectionValidation = {
  sectionId: string;
  label: string;
  present: boolean;
};

export function validateEra25FirstProductSliceStagingChecklistSections(
  content: string,
  sections: readonly Era25StagingChecklistSectionDef[] = ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_SECTIONS,
): {
  sectionsValid: boolean;
  sectionResults: readonly Era25StagingChecklistSectionValidation[];
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

export function validateEra25FirstProductSliceStagingChecklist(
  root: string = process.cwd(),
): {
  checklistDocPath: typeof ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_DOC;
  checklistPresent: boolean;
  sectionsValid: boolean;
  sectionResults: readonly Era25StagingChecklistSectionValidation[];
  missingSectionIds: readonly string[];
  missingSectionLabels: readonly string[];
} {
  const checklistDocPath = ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_DOC;
  const fullPath = join(root, checklistDocPath);

  if (!existsSync(fullPath)) {
    return {
      checklistDocPath,
      checklistPresent: false,
      sectionsValid: false,
      sectionResults: ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_SECTIONS.map((section) => ({
        sectionId: section.id,
        label: section.label,
        present: false,
      })),
      missingSectionIds: ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_SECTIONS.map(
        (section) => section.id,
      ),
      missingSectionLabels: ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_SECTIONS.map(
        (section) => section.label,
      ),
    };
  }

  const content = readFileSync(fullPath, "utf8");
  const validation = validateEra25FirstProductSliceStagingChecklistSections(content);

  return {
    checklistDocPath,
    checklistPresent: true,
    ...validation,
  };
}
