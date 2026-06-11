import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LOGIN_TODAY_PLAYBOOK_AUDIT_SCRIPT,
  LOGIN_TODAY_PLAYBOOK_E2E_POLICY_ID,
  LOGIN_TODAY_PLAYBOOK_E2E_SPEC,
  LOGIN_TODAY_PLAYBOOK_FLOW_HELPER,
  LOGIN_TODAY_PLAYBOOK_FLOW_STEPS,
  LOGIN_TODAY_PLAYBOOK_NPM_SCRIPT,
  LOGIN_TODAY_PLAYBOOK_READY_HELPER,
  LOGIN_TODAY_PLAYBOOK_UNIT_TEST,
  PLAYBOOKS_PATH,
} from "@/lib/qa/login-today-playbook-e2e-policy";

export type LoginTodayPlaybookE2EAuditSummary = {
  policyId: typeof LOGIN_TODAY_PLAYBOOK_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  todayPlaybookStripWired: boolean;
  playbooksPagePresent: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditLoginTodayPlaybookE2E(root = process.cwd()): LoginTodayPlaybookE2EAuditSummary {
  const specPath = join(root, LOGIN_TODAY_PLAYBOOK_E2E_SPEC);
  const flowPath = join(root, LOGIN_TODAY_PLAYBOOK_FLOW_HELPER);
  const readyPath = join(root, LOGIN_TODAY_PLAYBOOK_READY_HELPER);
  const todayPagePath = join(root, "app/dashboard/today/page.tsx");
  const playbooksPagePath = join(root, "app/dashboard/playbooks/page.tsx");

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);
  const playbooksPagePresent = existsSync(playbooksPagePath);

  let todayPlaybookStripWired = false;
  if (existsSync(todayPagePath)) {
    const todaySource = readFileSync(todayPagePath, "utf8");
    todayPlaybookStripWired =
      todaySource.includes("PlaybookTodayStrip") &&
      todaySource.includes("playbooks/playbook-today-strip");
  }

  const specReferencesPolicy =
    specPresent &&
    (readFileSync(specPath, "utf8").includes(LOGIN_TODAY_PLAYBOOK_E2E_POLICY_ID) ||
      readFileSync(specPath, "utf8").includes("LOGIN_TODAY_PLAYBOOK_E2E_POLICY_ID"));
  const flowReferencesPlaybooks =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes(PLAYBOOKS_PATH) ||
      readFileSync(flowPath, "utf8").includes("PLAYBOOKS_PATH"));

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    playbooksPagePresent &&
    todayPlaybookStripWired &&
    specReferencesPolicy &&
    flowReferencesPlaybooks &&
    LOGIN_TODAY_PLAYBOOK_FLOW_STEPS.length >= 4;

  return {
    policyId: LOGIN_TODAY_PLAYBOOK_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    todayPlaybookStripWired,
    playbooksPagePresent,
    flowStepCount: LOGIN_TODAY_PLAYBOOK_FLOW_STEPS.length,
    passed,
  };
}

export function formatLoginTodayPlaybookAuditLines(
  summary: LoginTodayPlaybookE2EAuditSummary,
): string[] {
  return [
    `Login → Today → Playbook E2E audit (${summary.policyId})`,
    `Spec: ${summary.specPresent ? "present" : "missing"} (${LOGIN_TODAY_PLAYBOOK_E2E_SPEC})`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Ready helper: ${summary.readyHelperPresent ? "present" : "missing"}`,
    `Today PlaybookTodayStrip wired: ${summary.todayPlaybookStripWired ? "yes" : "no"}`,
    `Playbooks hub page: ${summary.playbooksPagePresent ? "present" : "missing"}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${LOGIN_TODAY_PLAYBOOK_UNIT_TEST}`,
    `Audit script: ${LOGIN_TODAY_PLAYBOOK_AUDIT_SCRIPT}`,
    `NPM script: ${LOGIN_TODAY_PLAYBOOK_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
