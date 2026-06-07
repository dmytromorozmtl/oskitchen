import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { REGIONAL_TAX_COMPLIANCE_DOC_PATH } from "@/lib/compliance/regional-tax-compliance-absolute-final-policy";
import {
  REGIONAL_TAX_COMPLIANCE_GTM_SCALE_DOC_PATH,
  REGIONAL_TAX_COMPLIANCE_GTM_SCALE_HONESTY_MARKERS,
  REGIONAL_TAX_COMPLIANCE_GTM_SCALE_WIRING_PATHS,
} from "@/lib/marketing/regional-tax-compliance-gtm-scale-absolute-final-policy";

export type RegionalTaxComplianceGtmScaleAudit = {
  ok: boolean;
  failures: string[];
};

export function auditRegionalTaxComplianceGtmScaleWiring(
  root = process.cwd(),
): RegionalTaxComplianceGtmScaleAudit {
  const failures: string[] = [];

  for (const rel of REGIONAL_TAX_COMPLIANCE_GTM_SCALE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const docSource = readFileSync(join(root, REGIONAL_TAX_COMPLIANCE_GTM_SCALE_DOC_PATH), "utf8");
  const featureSource = readFileSync(join(root, REGIONAL_TAX_COMPLIANCE_DOC_PATH), "utf8");

  for (const marker of REGIONAL_TAX_COMPLIANCE_GTM_SCALE_HONESTY_MARKERS) {
    if (!docSource.includes(marker)) {
      failures.push(`doc missing honesty marker: ${marker}`);
    }
  }

  if (!docSource.includes(REGIONAL_TAX_COMPLIANCE_DOC_PATH)) {
    failures.push("doc missing feature compliance doc link");
  }

  if (!docSource.includes("/trust")) {
    failures.push("doc missing /trust link");
  }

  if (!featureSource.includes("regional-tax-compliance-absolute-final-v1")) {
    failures.push("feature doc missing policy id");
  }

  if (!docSource.includes("regional-tax-compliance-gtm-scale-absolute-final-v1")) {
    failures.push("doc missing GTM policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
