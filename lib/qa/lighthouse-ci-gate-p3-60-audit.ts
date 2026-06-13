import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LIGHTHOUSE_CI_GATE_P3_60_CLS_MAX,
  LIGHTHOUSE_CI_GATE_P3_60_DOC,
  LIGHTHOUSE_CI_GATE_P3_60_E2E_SPEC,
  LIGHTHOUSE_CI_GATE_P3_60_FCP_MAX_MS,
  LIGHTHOUSE_CI_GATE_P3_60_FLOW_HELPER,
  LIGHTHOUSE_CI_GATE_P3_60_FLOW_STEPS,
  LIGHTHOUSE_CI_GATE_P3_60_LCP_MAX_MS,
  LIGHTHOUSE_CI_GATE_P3_60_NPM_SCRIPTS,
  LIGHTHOUSE_CI_GATE_P3_60_POLICY_ID,
  LIGHTHOUSE_CI_GATE_P3_60_READY_HELPER,
  LIGHTHOUSE_CI_GATE_P3_60_WORKFLOW,
  LIGHTHOUSE_CI_GATE_P3_60_WIRING_PATHS,
} from "@/lib/qa/lighthouse-ci-gate-p3-60-policy";
import { validateLighthouseCiGateContract } from "@/lib/qa/lighthouse-ci-gate-p3-60-measurement";

export type LighthouseCiGateP3_60AuditSummary = {
  policyId: typeof LIGHTHOUSE_CI_GATE_P3_60_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  specWired: boolean;
  flowWired: boolean;
  contractValid: boolean;
  fcpGate2s: boolean;
  lcpGate3_5s: boolean;
  clsGate0_1: boolean;
  lighthouseWorkflowWired: boolean;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditLighthouseCiGateP3_60(root = process.cwd()): LighthouseCiGateP3_60AuditSummary {
  const wiringComplete = LIGHTHOUSE_CI_GATE_P3_60_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, LIGHTHOUSE_CI_GATE_P3_60_DOC))) {
    const source = readFileSync(join(root, LIGHTHOUSE_CI_GATE_P3_60_DOC), "utf8");
    docWired =
      source.includes(LIGHTHOUSE_CI_GATE_P3_60_POLICY_ID) &&
      source.includes("FCP") &&
      source.includes("LCP") &&
      source.includes("CLS");
  }

  let specWired = false;
  if (existsSync(join(root, LIGHTHOUSE_CI_GATE_P3_60_E2E_SPEC))) {
    const source = readFileSync(join(root, LIGHTHOUSE_CI_GATE_P3_60_E2E_SPEC), "utf8");
    specWired =
      source.includes(LIGHTHOUSE_CI_GATE_P3_60_POLICY_ID) &&
      source.includes("runLighthouseCiGateContractStep");
  }

  let flowWired = false;
  if (existsSync(join(root, LIGHTHOUSE_CI_GATE_P3_60_FLOW_HELPER))) {
    const source = readFileSync(join(root, LIGHTHOUSE_CI_GATE_P3_60_FLOW_HELPER), "utf8");
    flowWired =
      source.includes("runLighthouseCiGateContractStep") &&
      source.includes("fcpMaxMs") &&
      existsSync(join(root, LIGHTHOUSE_CI_GATE_P3_60_READY_HELPER));
  }

  const contract = validateLighthouseCiGateContract(root);
  const fcpGate2s = LIGHTHOUSE_CI_GATE_P3_60_FCP_MAX_MS === 2000;
  const lcpGate3_5s = LIGHTHOUSE_CI_GATE_P3_60_LCP_MAX_MS === 3500;
  const clsGate0_1 = LIGHTHOUSE_CI_GATE_P3_60_CLS_MAX === 0.1;

  let lighthouseWorkflowWired = false;
  if (existsSync(join(root, LIGHTHOUSE_CI_GATE_P3_60_WORKFLOW))) {
    const workflow = readFileSync(join(root, LIGHTHOUSE_CI_GATE_P3_60_WORKFLOW), "utf8");
    lighthouseWorkflowWired =
      workflow.includes("Core Web Vitals") &&
      workflow.includes("lighthouserc.core-web-vitals.cjs");
  }

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = LIGHTHOUSE_CI_GATE_P3_60_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed =
    wiringComplete &&
    docWired &&
    specWired &&
    flowWired &&
    contract.passed &&
    fcpGate2s &&
    lcpGate3_5s &&
    clsGate0_1 &&
    lighthouseWorkflowWired &&
    npmScriptsWired &&
    LIGHTHOUSE_CI_GATE_P3_60_FLOW_STEPS.length === 4;

  return {
    policyId: LIGHTHOUSE_CI_GATE_P3_60_POLICY_ID,
    wiringComplete,
    docWired,
    specWired,
    flowWired,
    contractValid: contract.passed,
    fcpGate2s,
    lcpGate3_5s,
    clsGate0_1,
    lighthouseWorkflowWired,
    npmScriptsWired,
    passed,
  };
}

export function formatLighthouseCiGateP3_60AuditLines(
  summary: LighthouseCiGateP3_60AuditSummary,
): string[] {
  return [
    `Lighthouse CI gate audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${LIGHTHOUSE_CI_GATE_P3_60_DOC})`,
    `E2E spec: ${summary.specWired ? "yes" : "no"} (${LIGHTHOUSE_CI_GATE_P3_60_E2E_SPEC})`,
    `Flow helper: ${summary.flowWired ? "yes" : "no"}`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `FCP <2s: ${summary.fcpGate2s ? "yes" : "no"}`,
    `LCP <3.5s: ${summary.lcpGate3_5s ? "yes" : "no"}`,
    `CLS <0.1: ${summary.clsGate0_1 ? "yes" : "no"}`,
    `Lighthouse workflow: ${summary.lighthouseWorkflowWired ? "yes" : "no"}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
