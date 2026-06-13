import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DESIGN_PARTNER_OUTREACH_DISCLAIMER,
  DESIGN_PARTNER_OUTREACH_OPERATORS,
} from "@/lib/marketing/design-partner-outreach-content";
import {
  DESIGN_PARTNER_OUTREACH_DOC,
  DESIGN_PARTNER_OUTREACH_EMAIL_SEQUENCE_DOC,
  DESIGN_PARTNER_OUTREACH_HONESTY_MARKERS,
  DESIGN_PARTNER_OUTREACH_LOI_DOC,
  DESIGN_PARTNER_OUTREACH_MONTREAL_MIN_COUNT,
  DESIGN_PARTNER_OUTREACH_OPERATOR_COUNT,
  DESIGN_PARTNER_OUTREACH_POLICY_ID,
  DESIGN_PARTNER_OUTREACH_WIRING_PATHS,
} from "@/lib/marketing/design-partner-outreach-policy";

export type DesignPartnerOutreachAuditSummary = {
  policyId: typeof DESIGN_PARTNER_OUTREACH_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  operatorCountCorrect: boolean;
  montrealCountCorrect: boolean;
  allResearchTargets: boolean;
  emailSequenceLinked: boolean;
  loiLinked: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditDesignPartnerOutreach(
  root = process.cwd(),
): DesignPartnerOutreachAuditSummary {
  const wiringComplete = DESIGN_PARTNER_OUTREACH_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let emailSequenceLinked = false;
  let loiLinked = false;
  let honestyMarkersPresent = false;

  if (existsSync(join(root, DESIGN_PARTNER_OUTREACH_DOC))) {
    const source = readFileSync(join(root, DESIGN_PARTNER_OUTREACH_DOC), "utf8");
    docWired =
      source.includes(DESIGN_PARTNER_OUTREACH_DISCLAIMER) &&
      source.includes(String(DESIGN_PARTNER_OUTREACH_OPERATOR_COUNT)) &&
      DESIGN_PARTNER_OUTREACH_OPERATORS.every((op) => source.includes(op.id));
  }

  if (existsSync(join(root, DESIGN_PARTNER_OUTREACH_EMAIL_SEQUENCE_DOC))) {
    const source = readFileSync(join(root, DESIGN_PARTNER_OUTREACH_EMAIL_SEQUENCE_DOC), "utf8");
    emailSequenceLinked =
      source.includes(DESIGN_PARTNER_OUTREACH_DOC) ||
      source.includes("design-partner-outreach.md");
  }

  if (existsSync(join(root, DESIGN_PARTNER_OUTREACH_LOI_DOC))) {
    const source = readFileSync(join(root, DESIGN_PARTNER_OUTREACH_LOI_DOC), "utf8");
    loiLinked =
      source.includes(DESIGN_PARTNER_OUTREACH_DOC) ||
      source.includes("design-partner-outreach.md");
  }

  const combined = [
    DESIGN_PARTNER_OUTREACH_DOC,
    "lib/marketing/design-partner-outreach-content.ts",
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  honestyMarkersPresent = DESIGN_PARTNER_OUTREACH_HONESTY_MARKERS.every((marker) =>
    combined.toLowerCase().includes(marker.toLowerCase()),
  );

  const montrealCount = DESIGN_PARTNER_OUTREACH_OPERATORS.filter(
    (op) => op.province === "QC",
  ).length;

  const operatorCountCorrect =
    DESIGN_PARTNER_OUTREACH_OPERATORS.length === DESIGN_PARTNER_OUTREACH_OPERATOR_COUNT;
  const montrealCountCorrect = montrealCount >= DESIGN_PARTNER_OUTREACH_MONTREAL_MIN_COUNT;
  const allResearchTargets = DESIGN_PARTNER_OUTREACH_OPERATORS.every(
    (op) => op.status === "research_target",
  );

  const passed =
    wiringComplete &&
    docWired &&
    operatorCountCorrect &&
    montrealCountCorrect &&
    allResearchTargets &&
    emailSequenceLinked &&
    loiLinked &&
    honestyMarkersPresent;

  return {
    policyId: DESIGN_PARTNER_OUTREACH_POLICY_ID,
    wiringComplete,
    docWired,
    operatorCountCorrect,
    montrealCountCorrect,
    allResearchTargets,
    emailSequenceLinked,
    loiLinked,
    honestyMarkersPresent,
    passed,
  };
}

export function formatDesignPartnerOutreachAuditLines(
  summary: DesignPartnerOutreachAuditSummary,
): string[] {
  return [
    `Design partner outreach audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"}`,
    `Operator count (${DESIGN_PARTNER_OUTREACH_OPERATOR_COUNT}): ${summary.operatorCountCorrect ? "yes" : "no"}`,
    `Montreal/QC count (≥${DESIGN_PARTNER_OUTREACH_MONTREAL_MIN_COUNT}): ${summary.montrealCountCorrect ? "yes" : "no"}`,
    `All research targets: ${summary.allResearchTargets ? "yes" : "no"}`,
    `Email sequence linked: ${summary.emailSequenceLinked ? "yes" : "no"}`,
    `LOI template linked: ${summary.loiLinked ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
