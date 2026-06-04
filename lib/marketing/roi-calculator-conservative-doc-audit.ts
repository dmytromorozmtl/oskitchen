import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ROI_CALCULATOR_CONSERVATIVE_DOC,
  ROI_CALCULATOR_CONSERVATIVE_REQUIRED_HEADINGS,
  ROI_CALCULATOR_FORBIDDEN_PHRASES,
} from "@/lib/marketing/roi-calculator-conservative-policy";

export type RoiCalculatorConservativeDocAudit = {
  docPath: typeof ROI_CALCULATOR_CONSERVATIVE_DOC;
  missingHeadings: string[];
  passed: boolean;
};

export function auditRoiCalculatorConservativeDoc(
  root = process.cwd(),
): RoiCalculatorConservativeDocAudit {
  const source = readFileSync(join(root, ROI_CALCULATOR_CONSERVATIVE_DOC), "utf8");
  const missingHeadings = ROI_CALCULATOR_CONSERVATIVE_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );

  return {
    docPath: ROI_CALCULATOR_CONSERVATIVE_DOC,
    missingHeadings,
    passed: missingHeadings.length === 0,
  };
}

export type RoiCalculatorConservativeLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintRoiCalculatorCopy(source: string): RoiCalculatorConservativeLint {
  const lower = source.toLowerCase();
  const forbiddenHits = ROI_CALCULATOR_FORBIDDEN_PHRASES.filter((phrase) =>
    lower.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
