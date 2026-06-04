import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditFinal12DesignStabilization } from "@/lib/execution/final-12-design-stabilization-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  TS_BUILD_GREEN_BUILD_SCRIPT,
  TS_BUILD_GREEN_POLICY_ID,
  TS_BUILD_GREEN_RUNNER_SCRIPT,
  TS_BUILD_GREEN_SUMMARY_ARTIFACT,
  TS_BUILD_GREEN_SUMMARY_VERSION,
  TS_BUILD_GREEN_TYPECHECK_SCRIPT,
} from "@/lib/execution/ts-build-green-policy";

/**
 * FINAL-13 — `npx tsc --noEmit` + `npm run build` green gate (task-207).
 */

export const FINAL_13_TS_BUILD_GREEN_POLICY_ID = TS_BUILD_GREEN_POLICY_ID;

export type Final13TsBuildGreenAuditReport = {
  policyId: typeof FINAL_13_TS_BUILD_GREEN_POLICY_ID;
  phaseId: "FINAL-13";
  taskSlot: number;
  artifactPresent: boolean;
  artifactSchemaValid: boolean;
  typecheckGreen: boolean;
  buildGreen: boolean;
  runnerScriptPresent: boolean;
  npmScriptsWired: boolean;
  final12Passed: boolean;
  passed: boolean;
};

function readPackageScripts(root: string): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

export function auditFinal13TsBuildGreen(root = process.cwd()): Final13TsBuildGreenAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[12]!;
  const artifactPath = join(root, TS_BUILD_GREEN_SUMMARY_ARTIFACT);
  const artifactPresent = existsSync(artifactPath);

  let artifactSchemaValid = false;
  let typecheckGreen = false;
  let buildGreen = false;

  if (artifactPresent) {
    const summary = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      version?: string;
      typecheckErrorCount?: number;
      buildExitCode?: number;
      overall?: string;
      runner?: string;
      honestyNote?: string;
    };

    artifactSchemaValid =
      summary.version === TS_BUILD_GREEN_SUMMARY_VERSION &&
      summary.runner === TS_BUILD_GREEN_RUNNER_SCRIPT &&
      typeof summary.honestyNote === "string" &&
      summary.honestyNote.length > 20;

    typecheckGreen = summary.typecheckErrorCount === 0;
    buildGreen = summary.buildExitCode === 0;
  }

  const scripts = readPackageScripts(root);
  const npmScriptsWired =
    scripts[TS_BUILD_GREEN_TYPECHECK_SCRIPT]?.includes("tsc") === true &&
    scripts[TS_BUILD_GREEN_BUILD_SCRIPT]?.includes("next build") === true;

  const runnerScriptPresent = existsSync(join(root, TS_BUILD_GREEN_RUNNER_SCRIPT));
  const final12Passed = auditFinal12DesignStabilization(root).passed;

  const passed =
    artifactPresent &&
    artifactSchemaValid &&
    typecheckGreen &&
    buildGreen &&
    runnerScriptPresent &&
    npmScriptsWired &&
    final12Passed;

  return {
    policyId: FINAL_13_TS_BUILD_GREEN_POLICY_ID,
    phaseId: "FINAL-13",
    taskSlot: phase.taskSlot,
    artifactPresent,
    artifactSchemaValid,
    typecheckGreen,
    buildGreen,
    runnerScriptPresent,
    npmScriptsWired,
    final12Passed,
    passed,
  };
}
