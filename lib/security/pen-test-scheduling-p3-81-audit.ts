import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PEN_TEST_SCHEDULING_P3_81_ARTIFACT,
  PEN_TEST_SCHEDULING_P3_81_DOC,
  PEN_TEST_SCHEDULING_P3_81_POLICY_ID,
  PEN_TEST_SCHEDULING_P3_81_PRIMARY_VENDOR,
  PEN_TEST_SCHEDULING_P3_81_QSA_INTRO,
  PEN_TEST_SCHEDULING_P3_81_QSA_TRACK,
  PEN_TEST_SCHEDULING_P3_81_TARGET_KICKOFF,
  PEN_TEST_SCHEDULING_P3_81_TARGET_REPORT,
  PEN_TEST_SCHEDULING_P3_81_UPSTREAM_DOCS,
  PEN_TEST_SCHEDULING_P3_81_WIRING_PATHS,
} from "@/lib/security/pen-test-scheduling-p3-81-policy";
import { runPenTestSchedulingBenchmarkP381 } from "@/lib/security/pen-test-scheduling-p3-81-scoring";

export type PenTestSchedulingP381AuditSummary = {
  policyId: typeof PEN_TEST_SCHEDULING_P3_81_POLICY_ID;
  wiringComplete: boolean;
  schedulingDocComplete: boolean;
  artifactScheduled: boolean;
  vendorSelected: boolean;
  qsaTrackScheduled: boolean;
  enterpriseGatesDefined: boolean;
  upstreamDocsPresent: boolean;
  scoringPassed: boolean;
  passPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditPenTestSchedulingP381(root = process.cwd()): PenTestSchedulingP381AuditSummary {
  const wiringComplete = PEN_TEST_SCHEDULING_P3_81_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  const docPath = join(root, PEN_TEST_SCHEDULING_P3_81_DOC);
  const doc = existsSync(docPath) ? readFileSync(docPath, "utf8") : "";
  const schedulingDocComplete =
    doc.includes(PEN_TEST_SCHEDULING_P3_81_POLICY_ID) &&
    /cobalt/i.test(doc) &&
    doc.includes(PEN_TEST_SCHEDULING_P3_81_TARGET_KICKOFF) &&
    /enterprise/i.test(doc) &&
    /QSA/i.test(doc);

  let artifactScheduled = false;
  let vendorSelected = false;
  let qsaTrackScheduled = false;
  let enterpriseGatesDefined = false;

  const artifactPath = join(root, PEN_TEST_SCHEDULING_P3_81_ARTIFACT);
  if (existsSync(artifactPath)) {
    const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      schedulingStatus?: string;
      primaryVendor?: string;
      qsaTrack?: string;
      qsaIntroDate?: string;
      targetKickoff?: string;
      targetReport?: string;
      enterpriseGates?: string[];
    };
    artifactScheduled = artifact.schedulingStatus === "SCHEDULED";
    vendorSelected = artifact.primaryVendor === PEN_TEST_SCHEDULING_P3_81_PRIMARY_VENDOR;
    qsaTrackScheduled =
      artifact.qsaTrack === PEN_TEST_SCHEDULING_P3_81_QSA_TRACK &&
      artifact.qsaIntroDate === PEN_TEST_SCHEDULING_P3_81_QSA_INTRO;
    enterpriseGatesDefined =
      Array.isArray(artifact.enterpriseGates) && artifact.enterpriseGates.length >= 3;
    if (artifact.targetKickoff === PEN_TEST_SCHEDULING_P3_81_TARGET_KICKOFF) {
      artifactScheduled = artifactScheduled && true;
    }
    if (artifact.targetReport === PEN_TEST_SCHEDULING_P3_81_TARGET_REPORT) {
      artifactScheduled = artifactScheduled && true;
    }
  }

  const upstreamDocsPresent = PEN_TEST_SCHEDULING_P3_81_UPSTREAM_DOCS.every((rel) =>
    existsSync(join(root, rel)),
  );

  const benchmark = runPenTestSchedulingBenchmarkP381({
    schedulingDocComplete,
    artifactScheduled,
    vendorSelected,
    qsaTrackScheduled,
    enterpriseGatesDefined,
    upstreamDocsPresent,
  });

  const artifactPresent = existsSync(artifactPath);

  const passed = wiringComplete && benchmark.passed && artifactPresent;

  return {
    policyId: PEN_TEST_SCHEDULING_P3_81_POLICY_ID,
    wiringComplete,
    schedulingDocComplete,
    artifactScheduled,
    vendorSelected,
    qsaTrackScheduled,
    enterpriseGatesDefined,
    upstreamDocsPresent,
    scoringPassed: benchmark.passed,
    passPct: benchmark.passPct,
    artifactPresent,
    passed,
  };
}

export function formatPenTestSchedulingP381AuditLines(
  summary: PenTestSchedulingP381AuditSummary,
): string[] {
  return [
    `Pen test scheduling (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Scheduling doc: ${summary.schedulingDocComplete ? "yes" : "no"}`,
    `Artifact scheduled: ${summary.artifactScheduled ? "yes" : "no"}`,
    `Vendor selected: ${summary.vendorSelected ? "yes" : "no"}`,
    `QSA track: ${summary.qsaTrackScheduled ? "yes" : "no"}`,
    `Enterprise gates: ${summary.enterpriseGatesDefined ? "yes" : "no"}`,
    `Upstream docs: ${summary.upstreamDocsPresent ? "yes" : "no"}`,
    `Benchmark: ${summary.passPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
