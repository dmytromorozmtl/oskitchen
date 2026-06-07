import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  REGIONAL_TAX_COMPLIANCE_DOC_PATH,
  REGIONAL_TAX_COMPLIANCE_GAP_REGIONS,
  REGIONAL_TAX_COMPLIANCE_HONESTY_MARKERS,
  REGIONAL_TAX_COMPLIANCE_INTERNATIONAL_PLAN_PATH,
  REGIONAL_TAX_COMPLIANCE_JURISDICTION_MODES,
  REGIONAL_TAX_COMPLIANCE_REQUIRED_HEADINGS,
  REGIONAL_TAX_COMPLIANCE_TAX_SETTINGS_PATH,
  REGIONAL_TAX_COMPLIANCE_TIMELINE_PHASES,
  REGIONAL_TAX_COMPLIANCE_WIRING_PATHS,
} from "@/lib/compliance/regional-tax-compliance-absolute-final-policy";

export type RegionalTaxComplianceDocAudit = {
  ok: boolean;
  missingHeadings: string[];
  phaseCount: number;
  gapRegionCount: number;
  failures: string[];
};

export function auditRegionalTaxComplianceDoc(
  source: string,
): Omit<RegionalTaxComplianceDocAudit, "failures" | "ok"> {
  const missingHeadings = REGIONAL_TAX_COMPLIANCE_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const phaseCount = REGIONAL_TAX_COMPLIANCE_TIMELINE_PHASES.filter((phase) =>
    source.includes(phase),
  ).length;
  const gapRegionCount = REGIONAL_TAX_COMPLIANCE_GAP_REGIONS.filter((region) =>
    source.includes(region),
  ).length;

  return { missingHeadings, phaseCount, gapRegionCount };
}

export function auditRegionalTaxComplianceWiring(
  root = process.cwd(),
): RegionalTaxComplianceDocAudit {
  const failures: string[] = [];

  for (const rel of REGIONAL_TAX_COMPLIANCE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const doc = readFileSync(join(root, REGIONAL_TAX_COMPLIANCE_DOC_PATH), "utf8");
  const docAudit = auditRegionalTaxComplianceDoc(doc);

  if (docAudit.missingHeadings.length > 0) {
    failures.push(`missing headings: ${docAudit.missingHeadings.join(", ")}`);
  }
  if (docAudit.phaseCount !== REGIONAL_TAX_COMPLIANCE_TIMELINE_PHASES.length) {
    failures.push(`expected ${REGIONAL_TAX_COMPLIANCE_TIMELINE_PHASES.length} timeline phases`);
  }
  if (docAudit.gapRegionCount !== REGIONAL_TAX_COMPLIANCE_GAP_REGIONS.length) {
    failures.push(`expected ${REGIONAL_TAX_COMPLIANCE_GAP_REGIONS.length} gap regions`);
  }

  for (const marker of REGIONAL_TAX_COMPLIANCE_HONESTY_MARKERS) {
    if (!doc.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!doc.includes("regional-tax-compliance-absolute-final-v1")) {
    failures.push("compliance doc missing absolute final policy id");
  }

  for (const mode of REGIONAL_TAX_COMPLIANCE_JURISDICTION_MODES) {
    if (!doc.includes(mode)) {
      failures.push(`compliance doc missing jurisdiction mode: ${mode}`);
    }
  }

  const taxSettings = readFileSync(join(root, REGIONAL_TAX_COMPLIANCE_TAX_SETTINGS_PATH), "utf8");
  for (const mode of REGIONAL_TAX_COMPLIANCE_JURISDICTION_MODES) {
    if (!taxSettings.includes(`"${mode}"`)) {
      failures.push(`tax-settings.ts missing mode: ${mode}`);
    }
  }

  const intlPlan = readFileSync(join(root, REGIONAL_TAX_COMPLIANCE_INTERNATIONAL_PLAN_PATH), "utf8");
  if (!intlPlan.includes("regional-tax-compliance.md")) {
    failures.push("international expansion plan missing regional tax compliance link");
  }

  const euResidency = readFileSync(join(root, "docs/eu-data-residency-roadmap.md"), "utf8");
  if (!euResidency.includes("regional-tax-compliance.md")) {
    failures.push("EU residency roadmap missing regional tax compliance link");
  }

  return {
    ok: failures.length === 0,
    failures,
    ...docAudit,
  };
}
