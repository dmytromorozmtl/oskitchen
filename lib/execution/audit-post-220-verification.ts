import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditProgramClosure } from "@/lib/execution/audit-program-closure";
import {
  POST_220_VERIFICATION_POLICY_ID,
  POST_220_VERIFICATION_SUMMARY_ARTIFACT,
} from "@/lib/execution/post-220-verification-policy";
import {
  PROGRAM_CLOSURE_POLICY_ID,
  PROGRAM_CLOSURE_SUMMARY_ARTIFACT,
} from "@/lib/execution/program-closure-policy";
import { buildFinalExecutionReport } from "@/lib/execution/sync-final-execution-report";
import { CANONICAL_TASK_SLOT_COUNT } from "@/lib/execution/tracker-preclosure-policy";

export type Post220VerificationReport = {
  policyId: typeof POST_220_VERIFICATION_POLICY_ID;
  programClosurePassed: boolean;
  canonicalSlotsDone: number;
  trackerDoneCount: number;
  trackerTotalCount: number;
  ready: boolean;
  goDecision: string;
  p0ArtifactOverall: string;
  nextOpsPriority: string;
  passed: boolean;
};

export function auditPost220Verification(root = process.cwd()): Post220VerificationReport {
  const closure = auditProgramClosure(root);
  const finalReport = buildFinalExecutionReport(root);

  const closureSummaryPath = join(root, PROGRAM_CLOSURE_SUMMARY_ARTIFACT);
  let programClosureArtifactPass = false;
  if (existsSync(closureSummaryPath)) {
    const summary = JSON.parse(readFileSync(closureSummaryPath, "utf8")) as {
      version?: string;
      overall?: string;
      proofStatus?: string;
    };
    programClosureArtifactPass =
      summary.version === PROGRAM_CLOSURE_POLICY_ID &&
      summary.overall === "PASS" &&
      summary.proofStatus === "proof_passed_program_closure";
  }

  const programClosurePassed = closure.passed && programClosureArtifactPass;
  const ready = finalReport.ready;
  const goDecision = finalReport.goDecision;
  const p0ArtifactOverall = finalReport.p0ProofStatus;

  const nextOpsPriority =
    p0ArtifactOverall !== "PASS" && p0ArtifactOverall !== "PASSED"
      ? "QA-01 P0 orchestrator staging (channel live smokes + p0 proof)"
      : goDecision !== "GO"
        ? "DEV-02 pilot GO/NO-GO builder after P0 PASS"
        : "none";

  const passed =
    programClosurePassed &&
    closure.canonicalSlotsDone === CANONICAL_TASK_SLOT_COUNT &&
    finalReport.trackerSync.doneCount === finalReport.trackerSync.totalCount;

  return {
    policyId: POST_220_VERIFICATION_POLICY_ID,
    programClosurePassed,
    canonicalSlotsDone: closure.canonicalSlotsDone,
    trackerDoneCount: finalReport.trackerSync.doneCount,
    trackerTotalCount: finalReport.trackerSync.totalCount,
    ready,
    goDecision,
    p0ArtifactOverall,
    nextOpsPriority,
    passed,
  };
}

export function readPost220SummaryArtifact(root = process.cwd()): {
  version?: string;
  overall?: string;
  proofStatus?: string;
} | null {
  const path = join(root, POST_220_VERIFICATION_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as {
    version?: string;
    overall?: string;
    proofStatus?: string;
  };
}
