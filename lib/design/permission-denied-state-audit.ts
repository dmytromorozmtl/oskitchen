import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditPermissionDenied } from "@/lib/design/permission-denied-audit-policy";
import {
  PERMISSION_DENIED_STATE_MODULE,
  PERMISSION_DENIED_STATE_POLICY_ID,
  PERMISSION_DENIED_STATE_REQUEST_ACCESS_TEST_ID,
  PERMISSION_DENIED_STATE_REQUIRED_ELEMENTS,
} from "@/lib/design/permission-denied-state-policy";

export type PermissionDeniedStateAuditSummary = {
  policyId: typeof PERMISSION_DENIED_STATE_POLICY_ID;
  modulePresent: boolean;
  iconWired: boolean;
  messageWired: boolean;
  requestAccessWired: boolean;
  surfaceCardPassesHelpCta: boolean;
  rbacAuditPassed: boolean;
  passed: boolean;
};

export function auditPermissionDeniedState(
  root = process.cwd(),
): PermissionDeniedStateAuditSummary {
  const modulePath = join(root, PERMISSION_DENIED_STATE_MODULE);
  const modulePresent = existsSync(modulePath);

  let iconWired = false;
  let messageWired = false;
  let requestAccessWired = false;
  let surfaceCardPassesHelpCta = false;

  if (modulePresent) {
    const source = readFileSync(modulePath, "utf8");
    iconWired =
      source.includes("ShieldOff") &&
      source.includes("PERMISSION_DENIED_STATE_ICON_CONTAINER_CLASS");
    messageWired =
      source.includes("CardTitle") &&
      source.includes("CardDescription") &&
      source.includes("description");
    requestAccessWired =
      source.includes("PERMISSION_DENIED_STATE_REQUEST_ACCESS_LABEL") &&
      source.includes("PERMISSION_DENIED_STATE_REQUEST_ACCESS_HREF") &&
      source.includes("PERMISSION_DENIED_STATE_REQUEST_ACCESS_TEST_ID");
    surfaceCardPassesHelpCta =
      source.includes("helpHref={PERMISSION_DENIED_STATE_REQUEST_ACCESS_HREF}") &&
      source.includes("helpLabel={PERMISSION_DENIED_STATE_REQUEST_ACCESS_LABEL}");
  }

  const rbacAudit = auditPermissionDenied(root);

  const passed =
    modulePresent &&
    iconWired &&
    messageWired &&
    requestAccessWired &&
    surfaceCardPassesHelpCta &&
    rbacAudit.passed &&
    PERMISSION_DENIED_STATE_REQUIRED_ELEMENTS.length === 3;

  return {
    policyId: PERMISSION_DENIED_STATE_POLICY_ID,
    modulePresent,
    iconWired,
    messageWired,
    requestAccessWired,
    surfaceCardPassesHelpCta,
    rbacAuditPassed: rbacAudit.passed,
    passed,
  };
}

export function formatPermissionDeniedStateAuditLines(
  summary: PermissionDeniedStateAuditSummary,
): string[] {
  return [
    `Permission-denied state audit (${summary.policyId})`,
    `Module: ${summary.modulePresent ? "present" : "missing"} (${PERMISSION_DENIED_STATE_MODULE})`,
    `Icon wired: ${summary.iconWired ? "yes" : "no"}`,
    `Message wired: ${summary.messageWired ? "yes" : "no"}`,
    `Request access CTA: ${summary.requestAccessWired ? "yes" : "no"}`,
    `Surface card help CTA: ${summary.surfaceCardPassesHelpCta ? "yes" : "no"}`,
    `RBAC modules audit: ${summary.rbacAuditPassed ? "PASS" : "FAIL"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
