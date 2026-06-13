import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditConsoleLogSurface } from "@/lib/devops/console-log-surface-audit";
import {
  CONSOLE_LOG_SWEEP_P3_71_RUNTIME_DIRS,
  CONSOLE_LOG_SWEEP_P3_71_UPSTREAM_POLICY_ID,
} from "@/lib/devops/console-log-sweep-p3-71-policy";

export type ConsoleLogSweepContractValidation = {
  passed: boolean;
  runtimeZero: boolean;
  libraryZero: boolean;
  top50Zero: boolean;
  eslintNoConsole: boolean;
  upstreamPolicyAligned: boolean;
  failures: string[];
};

export function validateConsoleLogSweepContract(
  root = process.cwd(),
): ConsoleLogSweepContractValidation {
  const failures: string[] = [];

  const summary = auditConsoleLogSurface(root);
  const runtimeZero = summary.counts.runtime === 0;
  const libraryZero = summary.counts.library === 0;
  const top50Zero = summary.counts.top50Remaining === 0;

  if (!runtimeZero) {
    failures.push(`runtime console.log hits: ${summary.counts.runtime} (${summary.runtimeHits.join(", ")})`);
  }
  if (!libraryZero) {
    failures.push(`library console.log hits: ${summary.counts.library} (${summary.libraryHits.join(", ")})`);
  }
  if (!top50Zero) {
    failures.push(`top-50 script hits: ${summary.counts.top50Remaining}`);
  }
  if (!summary.passed) {
    failures.push("upstream console-log-surface audit failed");
  }

  let eslintNoConsole = false;
  const eslintPath = join(root, "eslint.config.mjs");
  if (!existsSync(eslintPath)) {
    failures.push("missing eslint.config.mjs");
  } else {
    const eslint = readFileSync(eslintPath, "utf8");
    eslintNoConsole = eslint.includes("no-console");
    if (!eslintNoConsole) {
      failures.push("eslint.config.mjs missing no-console rule");
    }
  }

  const upstreamPolicyAligned = summary.policyId === CONSOLE_LOG_SWEEP_P3_71_UPSTREAM_POLICY_ID;
  if (!upstreamPolicyAligned) {
    failures.push(`upstream policy mismatch: ${summary.policyId}`);
  }

  for (const dir of CONSOLE_LOG_SWEEP_P3_71_RUNTIME_DIRS) {
    if (!existsSync(join(root, dir))) {
      failures.push(`missing runtime dir: ${dir}`);
    }
  }

  return {
    passed: failures.length === 0,
    runtimeZero,
    libraryZero,
    top50Zero,
    eslintNoConsole,
    upstreamPolicyAligned,
    failures,
  };
}
