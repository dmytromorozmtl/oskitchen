/**
 * First case study summary — wiring audit (Era 148).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CASE_STUDY_1_ERA148_CANONICAL_DOC,
  CASE_STUDY_1_ERA148_CAPABILITIES,
  CASE_STUDY_1_ERA148_DRAFT_ARTIFACT,
  CASE_STUDY_1_ERA148_FORBIDDEN_CLAIMS,
  CASE_STUDY_1_ERA148_LONG_FORM_SECTIONS,
  CASE_STUDY_1_ERA148_POLICY_ID,
  CASE_STUDY_1_ERA148_PUBLISH_STATUS,
  CASE_STUDY_1_ERA148_WIRING_PATHS,
} from "@/lib/marketing/case-study-1-era148-policy";

export const CASE_STUDY_1_ERA148_SMOKE_SUMMARY_VERSION = CASE_STUDY_1_ERA148_POLICY_ID;

export type CaseStudy1Era148Overall = "PASSED" | "FAILED" | "SKIPPED";

export type CaseStudy1Era148ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type CaseStudy1Era148Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type CaseStudy1Era148Summary = {
  version: typeof CASE_STUDY_1_ERA148_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: CaseStudy1Era148Overall;
  proofStatus: CaseStudy1Era148ProofStatus;
  wiringCertPassed: boolean;
  caseStudyDocAuditPassed: boolean;
  draftArtifactOverall: string | null;
  publishStatus: string;
  capabilities: readonly string[];
  steps: CaseStudy1Era148Step[];
  honestyNote: string;
};

export function auditCaseStudy1DocContent(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  const path = join(root, CASE_STUDY_1_ERA148_CANONICAL_DOC);
  if (!existsSync(path)) {
    return { ok: false, failures: [`missing ${CASE_STUDY_1_ERA148_CANONICAL_DOC}`] };
  }

  const source = readFileSync(path, "utf8");
  for (const section of CASE_STUDY_1_ERA148_LONG_FORM_SECTIONS) {
    if (!source.includes(section)) {
      failures.push(`missing section: ${section}`);
    }
  }

  const lower = source.toLowerCase();
  for (const phrase of CASE_STUDY_1_ERA148_FORBIDDEN_CLAIMS) {
    if (lower.includes(phrase)) {
      failures.push(`forbidden claim: ${phrase}`);
    }
  }

  if (!lower.includes("internal draft")) {
    failures.push("missing publish status: internal draft");
  }

  return { ok: failures.length === 0, failures };
}

export function auditCaseStudy1Era148Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of CASE_STUDY_1_ERA148_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const docAudit = auditCaseStudy1DocContent(root);
  if (!docAudit.ok) {
    failures.push(...docAudit.failures);
  }

  return { ok: failures.length === 0, failures };
}

export function readPilotCaseStudyDraftOverall(root: string = process.cwd()): string | null {
  const path = join(root, CASE_STUDY_1_ERA148_DRAFT_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveCaseStudy1Era148ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): CaseStudy1Era148ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildCaseStudy1Era148Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): CaseStudy1Era148Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const docAudit = auditCaseStudy1DocContent(root);
  const draftArtifactOverall = readPilotCaseStudyDraftOverall(root);

  const proofStatus = resolveCaseStudy1Era148ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: CaseStudy1Era148Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: CaseStudy1Era148Step[] = [
    {
      id: "wiring_audit",
      label: "LOI → Week 1 report → case study → publish gate wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 148 first case study cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "case_study_doc_audit",
      label: "Canonical case study doc (era75)",
      status: docAudit.ok ? "PASSED" : "FAILED",
      reason: docAudit.ok ? undefined : docAudit.failures.join("; "),
    },
    {
      id: "draft_artifact",
      label: "Pilot case study draft artifact (era17)",
      status:
        draftArtifactOverall === "PASSED"
          ? "PASSED"
          : draftArtifactOverall
            ? "SKIPPED"
            : "SKIPPED",
      reason:
        draftArtifactOverall === "PASSED"
          ? "Draft artifact PASSED"
          : draftArtifactOverall
            ? `draft artifact overall: ${draftArtifactOverall} — run npm run smoke:pilot-case-study-draft-era17`
            : "No draft artifact — run npm run smoke:pilot-case-study-draft-era17",
    },
  ];

  return {
    version: CASE_STUDY_1_ERA148_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    caseStudyDocAuditPassed: docAudit.ok,
    draftArtifactOverall,
    publishStatus: CASE_STUDY_1_ERA148_PUBLISH_STATUS,
    capabilities: CASE_STUDY_1_ERA148_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo internal draft case study + wiring — public publish requires PILOT_CASE_STUDY_CUSTOMER_APPROVAL=signed.",
  };
}

export function formatCaseStudy1Era148ReportLines(summary: CaseStudy1Era148Summary): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Case study doc audit: ${summary.caseStudyDocAuditPassed ? "PASSED" : "FAILED"}`,
    `Publish status: ${summary.publishStatus}`,
    `Draft artifact: ${summary.draftArtifactOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
