import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  COMMERCIAL_PILOT_RUNBOOK_POLICY_ID,
  COMMERCIAL_PILOT_RUNBOOK_REQUIRED_SECTIONS,
} from "@/lib/commercial/commercial-pilot-runbook-policy";
import { evaluatePilotGoNoGoIntegrity } from "@/lib/commercial/pilot-gono-go-integrity-era28";
import { PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-gono-go-era17-policy";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { auditFinal02P0OrchestratorArtifact } from "@/lib/execution/final-02-p0-orchestrator-artifact-audit-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

/**
 * FINAL-03 — pilot GO/NO-GO integrity gate (honest NO-GO, era28 anti-fake-GO).
 */

export const FINAL_03_PILOT_GONO_GO_POLICY_ID = "final-03-pilot-gono-go-v1" as const;

export const PILOT_GONO_GO_BUILDER_SCRIPT = "scripts/smoke-pilot-gono-go-era17.ts" as const;

export const PILOT_GONO_GO_NPM_SCRIPT = "smoke:pilot-gono-go" as const;

export const PILOT_GONO_GO_REQUIRED_EVIDENCE_GATE_IDS = [
  "tier0",
  "tier1",
  "tier2",
  "p0_staging_proof",
  "forbidden_claims_enforcement",
] as const;

export type Final03PilotGonoGoAuditReport = {
  policyId: typeof FINAL_03_PILOT_GONO_GO_POLICY_ID;
  phaseId: "FINAL-03";
  taskSlot: number;
  artifactPresent: boolean;
  artifactHonestNoGo: boolean;
  integrityPassed: boolean;
  runbookPresent: boolean;
  builderWired: boolean;
  final02Passed: boolean;
  passed: boolean;
};

function readSurface(root: string, relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

function readPackageScripts(root: string): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function auditGonoGoArtifactHonest(root: string): boolean {
  const raw = readSurface(root, PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT);
  const summary = JSON.parse(raw) as PilotGoNoGoSummary;
  const gateIds = new Set(summary.evidenceGates?.map((gate) => gate.id) ?? []);

  return (
    summary.version === "era17-pilot-gono-go-v1" &&
    summary.decision === "NO-GO" &&
    Array.isArray(summary.blockers) &&
    summary.blockers.length >= 3 &&
    summary.customerName === null &&
    summary.blockerTaxonomy?.policyId === "era20-pilot-gono-go-blocker-taxonomy-v1" &&
    summary.executionReadiness?.policyId === "era20-pilot-execution-readiness-v1" &&
    PILOT_GONO_GO_REQUIRED_EVIDENCE_GATE_IDS.every((id) => gateIds.has(id))
  );
}

function auditCommercialRunbook(root: string): boolean {
  const source = readSurface(root, "docs/commercial-pilot-runbook.md");
  if (!source.includes(COMMERCIAL_PILOT_RUNBOOK_POLICY_ID)) return false;
  return COMMERCIAL_PILOT_RUNBOOK_REQUIRED_SECTIONS.every((section) =>
    source.includes(`## ${section}`),
  );
}

export function auditFinal03PilotGonoGo(root = process.cwd()): Final03PilotGonoGoAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[2]!;
  const artifactPresent = existsSync(join(root, PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT));
  const artifactHonestNoGo = artifactPresent && auditGonoGoArtifactHonest(root);

  const integrity = evaluatePilotGoNoGoIntegrity(root);
  const integrityPassed = integrity.integrityPassed && integrity.decision === "NO-GO";

  const scripts = readPackageScripts(root);
  const builderWired =
    scripts[PILOT_GONO_GO_NPM_SCRIPT]?.includes(PILOT_GONO_GO_BUILDER_SCRIPT) ?? false;

  const runbookPresent = auditCommercialRunbook(root);
  const final02Passed = auditFinal02P0OrchestratorArtifact(root).passed;

  const passed =
    artifactHonestNoGo &&
    integrityPassed &&
    runbookPresent &&
    builderWired &&
    final02Passed;

  return {
    policyId: FINAL_03_PILOT_GONO_GO_POLICY_ID,
    phaseId: "FINAL-03",
    taskSlot: phase.taskSlot,
    artifactPresent,
    artifactHonestNoGo,
    integrityPassed,
    runbookPresent,
    builderWired,
    final02Passed,
    passed,
  };
}
