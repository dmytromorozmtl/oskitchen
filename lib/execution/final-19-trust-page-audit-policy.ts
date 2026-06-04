import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  INTEGRATION_HEALTH_MOAT_SUMMARY_ARTIFACT,
  INTEGRATION_HEALTH_MOAT_SUMMARY_VERSION,
} from "@/lib/execution/integration-health-moat-policy";
import {
  TRUST_BETA_BADGE_COMPONENT,
  TRUST_BETA_BADGE_MARKERS,
  TRUST_MATURITY_SECTION_COMPONENT,
  TRUST_MATURITY_SECTION_MARKERS,
  TRUST_PAGE_MARKERS,
  TRUST_PAGE_POLICY_ID,
  TRUST_PAGE_ROUTE,
  TRUST_PAGE_RUNNER_SCRIPT,
  TRUST_PAGE_SUMMARY_ARTIFACT,
  TRUST_PAGE_SUMMARY_VERSION,
  TRUST_PAGE_VITEST_SPEC,
} from "@/lib/execution/trust-page-policy";

/**
 * FINAL-19 — Trust page BETA / Preview / SKIPPED gate (task-213).
 */

export const FINAL_19_TRUST_PAGE_POLICY_ID = TRUST_PAGE_POLICY_ID;

export type Final19TrustPageAuditReport = {
  policyId: typeof FINAL_19_TRUST_PAGE_POLICY_ID;
  phaseId: "FINAL-19";
  taskSlot: number;
  surfacesRegistryHonest: boolean;
  trustVitestSpecPresent: boolean;
  artifactPresent: boolean;
  artifactSchemaValid: boolean;
  trustHonest: boolean;
  runnerScriptPresent: boolean;
  final18Passed: boolean;
  passed: boolean;
};

function readFinal18ArtifactPassed(root: string): boolean {
  const path = join(root, INTEGRATION_HEALTH_MOAT_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return false;
  const summary = JSON.parse(readFileSync(path, "utf8")) as {
    version?: string;
    overall?: string;
    proofStatus?: string;
    moatVitestPassed?: boolean;
  };
  return (
    summary.version === INTEGRATION_HEALTH_MOAT_SUMMARY_VERSION &&
    summary.overall === "PASS" &&
    summary.proofStatus === "proof_passed_moat_surfaces" &&
    summary.moatVitestPassed === true
  );
}

function fileHasMarkers(root: string, relativePath: string, markers: readonly string[]): boolean {
  const path = join(root, relativePath);
  if (!existsSync(path)) return false;
  const source = readFileSync(path, "utf8");
  return markers.every((marker) => source.includes(marker));
}

export function auditTrustPageMaturitySurfaces(root = process.cwd()): boolean {
  return (
    fileHasMarkers(root, TRUST_PAGE_ROUTE, TRUST_PAGE_MARKERS) &&
    fileHasMarkers(root, TRUST_MATURITY_SECTION_COMPONENT, TRUST_MATURITY_SECTION_MARKERS) &&
    fileHasMarkers(root, TRUST_BETA_BADGE_COMPONENT, TRUST_BETA_BADGE_MARKERS)
  );
}

export function auditFinal19TrustPage(root = process.cwd()): Final19TrustPageAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[18]!;
  const surfacesRegistryHonest = auditTrustPageMaturitySurfaces(root);
  const trustVitestSpecPresent = existsSync(join(root, TRUST_PAGE_VITEST_SPEC));

  const artifactPath = join(root, TRUST_PAGE_SUMMARY_ARTIFACT);
  const artifactPresent = existsSync(artifactPath);

  let artifactSchemaValid = false;
  let trustHonest = false;

  if (artifactPresent) {
    const summary = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      version?: string;
      overall?: string;
      proofStatus?: string;
      trustVitestPassed?: boolean;
      trustPagePresent?: boolean;
      maturitySectionPresent?: boolean;
      betaBadgePresent?: boolean;
      runner?: string;
      honestyNote?: string;
    };

    artifactSchemaValid =
      summary.version === TRUST_PAGE_SUMMARY_VERSION &&
      summary.runner === TRUST_PAGE_RUNNER_SCRIPT &&
      typeof summary.honestyNote === "string" &&
      summary.honestyNote.length > 20 &&
      summary.trustVitestPassed === true &&
      summary.trustPagePresent === true &&
      summary.maturitySectionPresent === true &&
      summary.betaBadgePresent === true;

    trustHonest =
      summary.overall === "PASS" && summary.proofStatus === "proof_passed_trust_maturity_labels";
  }

  const runnerScriptPresent = existsSync(join(root, TRUST_PAGE_RUNNER_SCRIPT));
  const final18Passed = readFinal18ArtifactPassed(root);

  const passed =
    surfacesRegistryHonest &&
    trustVitestSpecPresent &&
    artifactPresent &&
    artifactSchemaValid &&
    trustHonest &&
    runnerScriptPresent &&
    final18Passed;

  return {
    policyId: FINAL_19_TRUST_PAGE_POLICY_ID,
    phaseId: "FINAL-19",
    taskSlot: phase.taskSlot,
    surfacesRegistryHonest,
    trustVitestSpecPresent,
    artifactPresent,
    artifactSchemaValid,
    trustHonest,
    runnerScriptPresent,
    final18Passed,
    passed,
  };
}
