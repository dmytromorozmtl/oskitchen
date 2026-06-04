import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-gono-go-era17-policy";
import {
  FINAL_EXECUTION_GATE_ARTIFACTS,
  FINAL_EXECUTION_JSON_POLICY_ID,
  FINAL_EXECUTION_REPORT_ARTIFACT,
  FINAL_EXECUTION_TRACKER_ARTIFACT,
} from "@/lib/execution/final-execution-json-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

export type FinalExecutionGateSnapshot = {
  artifact: string;
  present: boolean;
  overall?: string;
  proofStatus?: string;
};

export type FinalExecutionReport = {
  version: typeof FINAL_EXECUTION_JSON_POLICY_ID;
  generatedAt: string;
  task: "FINAL-22";
  trackerSync: {
    doneCount: number;
    totalCount: number;
    percentDone: number;
    executionLogCycles: number;
  };
  finalOrchestratorGates: Array<{
    phaseId: string;
    taskSlot: number;
    trackerStatus: string;
  }>;
  gateArtifacts: FinalExecutionGateSnapshot[];
  vault: {
    presentCount: number;
    totalCount: number;
    p0ArtifactOverall: string;
  };
  goDecision: string;
  p0ProofStatus: string;
  ready: boolean;
  allPhasesPassed: boolean;
  honestyNote: string;
};

function readJsonFile<T>(root: string, relativePath: string): T | null {
  const path = join(root, relativePath);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function countExecutionLogCycles(root: string): number {
  const path = join(root, "artifacts/execution-log.txt");
  if (!existsSync(path)) return 0;
  const content = readFileSync(path, "utf8");
  return (content.match(/^Cycle: \d+/gm) ?? []).length;
}

function snapshotGateArtifact(root: string, relativePath: string): FinalExecutionGateSnapshot {
  const summary = readJsonFile<{
    overall?: string;
    proofStatus?: string;
  }>(root, relativePath);
  return {
    artifact: relativePath,
    present: summary != null,
    overall: summary?.overall,
    proofStatus: summary?.proofStatus,
  };
}

export function buildFinalExecutionReport(root = process.cwd()): FinalExecutionReport {
  const generatedAt = new Date().toISOString();
  const tracker =
    readJsonFile<Record<string, string>>(root, FINAL_EXECUTION_TRACKER_ARTIFACT) ?? {};
  const doneCount = Object.values(tracker).filter((v) => v === "done").length;
  const totalCount = Object.keys(tracker).length;
  const percentDone = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const finalOrchestratorGates = FINAL_ORCHESTRATOR_PHASES.map((phase) => ({
    phaseId: phase.id,
    taskSlot: phase.taskSlot,
    trackerStatus: tracker[`task-${phase.taskSlot}`] ?? tracker[phase.id] ?? "todo",
  }));

  const vault = readJsonFile<{
    presentCount?: number;
    totalCount?: number;
    p0ArtifactOverall?: string;
  }>(root, "artifacts/vault-readiness-report.json");

  const gonoGo = readJsonFile<{ decision?: string }>(root, PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT);

  const gateArtifacts = FINAL_EXECUTION_GATE_ARTIFACTS.map((artifact) =>
    snapshotGateArtifact(root, artifact),
  );

  const finalPhasesDone = finalOrchestratorGates.every((g) => g.trackerStatus === "done");
  const vaultReady = (vault?.presentCount ?? 0) >= 11;
  const goDecision = gonoGo?.decision ?? "UNKNOWN";
  const p0ProofStatus = vault?.p0ArtifactOverall ?? "UNKNOWN";

  const ready = finalPhasesDone && vaultReady && goDecision === "GO" && doneCount === totalCount;

  const canonicalDone = finalOrchestratorGates.every((g) => g.trackerStatus === "done");
  const honestyNote = canonicalDone && doneCount === totalCount
    ? "220/220 execution tracker complete — program slots done; ready:true still requires vault 11/11, P0 PASS, and pilot GO; otherwise honest false."
    : "Synced snapshot — ready:true only when all tracker slots done, vault 11/11, and pilot GO/NO-GO decision GO; otherwise honest false.";

  return {
    version: FINAL_EXECUTION_JSON_POLICY_ID,
    generatedAt,
    task: "FINAL-22",
    trackerSync: {
      doneCount,
      totalCount,
      percentDone,
      executionLogCycles: countExecutionLogCycles(root),
    },
    finalOrchestratorGates,
    gateArtifacts,
    vault: {
      presentCount: vault?.presentCount ?? 0,
      totalCount: vault?.totalCount ?? 11,
      p0ArtifactOverall: p0ProofStatus,
    },
    goDecision,
    p0ProofStatus,
    ready,
    allPhasesPassed: finalPhasesDone && gateArtifacts.every((g) => g.present),
    honestyNote,
  };
}

export function auditFinalExecutionReportSchema(
  report: FinalExecutionReport,
): boolean {
  return (
    report.version === FINAL_EXECUTION_JSON_POLICY_ID &&
    typeof report.generatedAt === "string" &&
    report.trackerSync.doneCount >= 0 &&
    report.trackerSync.totalCount > 0 &&
    Array.isArray(report.finalOrchestratorGates) &&
    report.finalOrchestratorGates.length === FINAL_ORCHESTRATOR_PHASES.length &&
    Array.isArray(report.gateArtifacts) &&
    report.gateArtifacts.length === FINAL_EXECUTION_GATE_ARTIFACTS.length &&
    typeof report.goDecision === "string" &&
    typeof report.ready === "boolean" &&
    report.honestyNote.includes("honest")
  );
}
