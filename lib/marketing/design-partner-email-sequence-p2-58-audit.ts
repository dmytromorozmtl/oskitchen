import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEPS,
} from "@/lib/marketing/design-partner-email-sequence-p2-58-content";
import {
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_DOC,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_HONESTY_MARKERS,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_LOI_DOC,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_POLICY_ID,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEP_COUNT,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEP_IDS,
  DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_WIRING_PATHS,
} from "@/lib/marketing/design-partner-email-sequence-p2-58-policy";

export type DesignPartnerEmailSequenceP258AuditSummary = {
  policyId: typeof DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  fiveStepsOk: boolean;
  stepOrderOk: boolean;
  loiLinked: boolean;
  offerWired: boolean;
  demoWired: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditDesignPartnerEmailSequenceP258(
  root = process.cwd(),
): DesignPartnerEmailSequenceP258AuditSummary {
  const wiringComplete = DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let loiLinked = false;
  let offerWired = false;
  let demoWired = false;
  let honestyMarkersPresent = false;

  if (existsSync(join(root, DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_DOC))) {
    const source = readFileSync(join(root, DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_DOC), "utf8");
    docWired =
      source.includes(DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_POLICY_ID) &&
      source.includes("5-step") &&
      DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEP_IDS.every((id) => source.includes(id));
    loiLinked = source.includes("loi-design-partner-template.md");
    offerWired =
      source.toLowerCase().includes("90 days") &&
      source.toLowerCase().includes("design partner program");
    demoWired = source.includes("/demo") && source.includes("/book-demo");
    honestyMarkersPresent = DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_HONESTY_MARKERS.every(
      (marker) => source.toLowerCase().includes(marker.toLowerCase()),
    );
  }

  const fiveStepsOk =
    DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEP_COUNT === 5 &&
    DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEPS.length === 5;

  const stepOrderOk =
    DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEPS[0]?.id === "problem" &&
    DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEPS[1]?.id === "solution" &&
    DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEPS[2]?.id === "demo" &&
    DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEPS[3]?.id === "offer" &&
    DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_STEPS[4]?.id === "follow_up";

  const passed =
    wiringComplete &&
    docWired &&
    fiveStepsOk &&
    stepOrderOk &&
    loiLinked &&
    offerWired &&
    demoWired &&
    honestyMarkersPresent;

  return {
    policyId: DESIGN_PARTNER_EMAIL_SEQUENCE_P2_58_POLICY_ID,
    wiringComplete,
    docWired,
    fiveStepsOk,
    stepOrderOk,
    loiLinked,
    offerWired,
    demoWired,
    honestyMarkersPresent,
    passed,
  };
}

export function formatDesignPartnerEmailSequenceP258AuditLines(
  summary: DesignPartnerEmailSequenceP258AuditSummary,
): string[] {
  return [
    `Design partner email sequence (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `5 steps: ${summary.fiveStepsOk ? "yes" : "no"}`,
    `Step order: ${summary.stepOrderOk ? "yes" : "no"}`,
    `LOI linked: ${summary.loiLinked ? "yes" : "no"}`,
    `Offer (90-day): ${summary.offerWired ? "yes" : "no"}`,
    `Demo paths: ${summary.demoWired ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
