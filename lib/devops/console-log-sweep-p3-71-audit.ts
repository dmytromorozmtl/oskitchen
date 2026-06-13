import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CONSOLE_LOG_SWEEP_P3_71_DOC,
  CONSOLE_LOG_SWEEP_P3_71_NPM_SCRIPTS,
  CONSOLE_LOG_SWEEP_P3_71_POLICY_ID,
  CONSOLE_LOG_SWEEP_P3_71_UPSTREAM_DOC,
  CONSOLE_LOG_SWEEP_P3_71_UPSTREAM_POLICY_ID,
  CONSOLE_LOG_SWEEP_P3_71_WIRING_PATHS,
} from "@/lib/devops/console-log-sweep-p3-71-policy";
import { validateConsoleLogSweepContract } from "@/lib/devops/console-log-sweep-p3-71-measurement";

export type ConsoleLogSweepP3_71AuditSummary = {
  policyId: typeof CONSOLE_LOG_SWEEP_P3_71_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  upstreamPolicyAligned: boolean;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditConsoleLogSweepP3_71(
  root = process.cwd(),
): ConsoleLogSweepP3_71AuditSummary {
  const wiringComplete = CONSOLE_LOG_SWEEP_P3_71_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, CONSOLE_LOG_SWEEP_P3_71_DOC))) {
    const source = readFileSync(join(root, CONSOLE_LOG_SWEEP_P3_71_DOC), "utf8");
    docWired =
      source.includes(CONSOLE_LOG_SWEEP_P3_71_POLICY_ID) &&
      source.includes(CONSOLE_LOG_SWEEP_P3_71_UPSTREAM_DOC) &&
      source.includes(CONSOLE_LOG_SWEEP_P3_71_UPSTREAM_POLICY_ID) &&
      source.includes("app/");
  }

  const contract = validateConsoleLogSweepContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = CONSOLE_LOG_SWEEP_P3_71_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed = wiringComplete && docWired && contract.passed && npmScriptsWired;

  return {
    policyId: CONSOLE_LOG_SWEEP_P3_71_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    upstreamPolicyAligned: contract.upstreamPolicyAligned,
    npmScriptsWired,
    passed,
  };
}

export function formatConsoleLogSweepP3_71AuditLines(
  summary: ConsoleLogSweepP3_71AuditSummary,
): string[] {
  return [
    `Console.log sweep audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${CONSOLE_LOG_SWEEP_P3_71_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Upstream P1-38: ${summary.upstreamPolicyAligned ? "yes" : "no"}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
