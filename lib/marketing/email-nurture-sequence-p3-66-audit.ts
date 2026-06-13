import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  EMAIL_NURTURE_SEQUENCE_P3_66_DOC,
  EMAIL_NURTURE_SEQUENCE_P3_66_NPM_SCRIPTS,
  EMAIL_NURTURE_SEQUENCE_P3_66_PLAYBOOK_DOC,
  EMAIL_NURTURE_SEQUENCE_P3_66_POLICY_ID,
  EMAIL_NURTURE_SEQUENCE_P3_66_UPSTREAM_POLICY_ID,
  EMAIL_NURTURE_SEQUENCE_P3_66_WIRING_PATHS,
} from "@/lib/marketing/email-nurture-sequence-p3-66-policy";
import { validateEmailNurtureSequenceContract } from "@/lib/marketing/email-nurture-sequence-p3-66-measurement";

export type EmailNurtureSequenceP3_66AuditSummary = {
  policyId: typeof EMAIL_NURTURE_SEQUENCE_P3_66_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  upstreamPolicyAligned: boolean;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditEmailNurtureSequenceP3_66(
  root = process.cwd(),
): EmailNurtureSequenceP3_66AuditSummary {
  const wiringComplete = EMAIL_NURTURE_SEQUENCE_P3_66_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, EMAIL_NURTURE_SEQUENCE_P3_66_DOC))) {
    const source = readFileSync(join(root, EMAIL_NURTURE_SEQUENCE_P3_66_DOC), "utf8");
    docWired =
      source.includes(EMAIL_NURTURE_SEQUENCE_P3_66_POLICY_ID) &&
      source.includes(EMAIL_NURTURE_SEQUENCE_P3_66_PLAYBOOK_DOC) &&
      source.includes(EMAIL_NURTURE_SEQUENCE_P3_66_UPSTREAM_POLICY_ID);
  }

  const contract = validateEmailNurtureSequenceContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = EMAIL_NURTURE_SEQUENCE_P3_66_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed = wiringComplete && docWired && contract.passed && npmScriptsWired;

  return {
    policyId: EMAIL_NURTURE_SEQUENCE_P3_66_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    upstreamPolicyAligned: contract.upstreamDocOk,
    npmScriptsWired,
    passed,
  };
}

export function formatEmailNurtureSequenceP3_66AuditLines(
  summary: EmailNurtureSequenceP3_66AuditSummary,
): string[] {
  return [
    `Email nurture sequence audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${EMAIL_NURTURE_SEQUENCE_P3_66_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Upstream MKT-19: ${summary.upstreamPolicyAligned ? "yes" : "no"}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
