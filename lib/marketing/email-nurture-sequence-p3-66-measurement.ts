import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  auditEmailNurture5SequenceDoc,
  EMAIL_NURTURE_5_SEQUENCE_EMAILS,
} from "@/lib/marketing/email-nurture-5-sequence-policy";
import {
  EMAIL_NURTURE_SEQUENCE_P3_66_EMAIL_COUNT,
  EMAIL_NURTURE_SEQUENCE_P3_66_PLAYBOOK_DOC,
  EMAIL_NURTURE_SEQUENCE_P3_66_REQUIRED_EMAIL_HEADINGS,
} from "@/lib/marketing/email-nurture-sequence-p3-66-policy";

export type EmailNurtureSequenceContractValidation = {
  passed: boolean;
  upstreamDocOk: boolean;
  fiveEmailsPresent: boolean;
  claimsLintOk: boolean;
  outboundHandoffWired: boolean;
  failures: string[];
};

export function validateEmailNurtureSequenceContract(
  root = process.cwd(),
): EmailNurtureSequenceContractValidation {
  const failures: string[] = [];

  const playbookPath = join(root, EMAIL_NURTURE_SEQUENCE_P3_66_PLAYBOOK_DOC);
  if (!existsSync(playbookPath)) {
    failures.push(`missing playbook: ${EMAIL_NURTURE_SEQUENCE_P3_66_PLAYBOOK_DOC}`);
  }

  let fiveEmailsPresent = false;
  let claimsLintOk = false;
  if (existsSync(playbookPath)) {
    const source = readFileSync(playbookPath, "utf8");
    const missingEmails = EMAIL_NURTURE_SEQUENCE_P3_66_REQUIRED_EMAIL_HEADINGS.filter(
      (heading) => !source.includes(heading),
    );
    fiveEmailsPresent = missingEmails.length === 0;
    if (!fiveEmailsPresent) {
      failures.push(`playbook missing email sections: ${missingEmails.join(", ")}`);
    }

    const sendableCopy = source.split("## Forbidden claims")[0] ?? source;
    const honestyMarkers = ["Honesty rule", "BETA", "SKIPPED", "0 signed founding customers"];
    claimsLintOk = honestyMarkers.every((marker) => sendableCopy.includes(marker));
    if (!claimsLintOk) {
      failures.push("sendable email copy missing honesty markers (BETA/SKIPPED/0 signed)");
    }

    if (!source.includes("## Forbidden claims")) {
      failures.push("playbook missing Forbidden claims section");
    }
  }

  if (EMAIL_NURTURE_5_SEQUENCE_EMAILS.length !== EMAIL_NURTURE_SEQUENCE_P3_66_EMAIL_COUNT) {
    failures.push("upstream policy email count is not 5");
  }

  const upstream = auditEmailNurture5SequenceDoc(root);
  if (!upstream.passed) {
    failures.push(`upstream doc audit failed: ${upstream.missingHeadings.join(", ")}`);
  }

  let outboundHandoffWired = false;
  const outboundPath = join(root, "docs/design-partner-email-sequence.md");
  if (!existsSync(outboundPath)) {
    failures.push("missing outbound handoff doc: docs/design-partner-email-sequence.md");
  } else {
    const outbound = readFileSync(outboundPath, "utf8");
    outboundHandoffWired = outbound.includes("design-partner") || outbound.includes("Design partner");
    if (!outboundHandoffWired) {
      failures.push("design-partner-email-sequence.md missing outbound reference");
    }
  }

  return {
    passed: failures.length === 0 && upstream.passed,
    upstreamDocOk: upstream.passed,
    fiveEmailsPresent,
    claimsLintOk,
    outboundHandoffWired,
    failures,
  };
}
