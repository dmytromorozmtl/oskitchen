/**
 * First design partner LOI signed summary — wiring audit (Era 146).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LOI_SIGNED_ERA146_CANONICAL_DOC,
  LOI_SIGNED_ERA146_CAPABILITIES,
  LOI_SIGNED_ERA146_DOC_REQUIRED_HEADINGS,
  LOI_SIGNED_ERA146_FORBIDDEN_CLAIMS,
  LOI_SIGNED_ERA146_POLICY_ID,
  LOI_SIGNED_ERA146_POST_SIGNATURE_STEPS,
  LOI_SIGNED_ERA146_WIRING_PATHS,
} from "@/lib/commercial/loi-signed-era146-policy";

export const LOI_SIGNED_ERA146_SMOKE_SUMMARY_VERSION = LOI_SIGNED_ERA146_POLICY_ID;

export type LoiSignedEra146Overall = "PASSED" | "FAILED" | "SKIPPED";

export type LoiSignedEra146ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type LoiSignedEra146Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type LoiSignedEra146Summary = {
  version: typeof LOI_SIGNED_ERA146_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: LoiSignedEra146Overall;
  proofStatus: LoiSignedEra146ProofStatus;
  wiringCertPassed: boolean;
  loiDocAuditPassed: boolean;
  pilotGonoGoOverall: string | null;
  capabilities: readonly string[];
  steps: LoiSignedEra146Step[];
  honestyNote: string;
};

export function auditLoiSignedDocContent(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  const path = join(root, LOI_SIGNED_ERA146_CANONICAL_DOC);
  if (!existsSync(path)) {
    return { ok: false, failures: [`missing ${LOI_SIGNED_ERA146_CANONICAL_DOC}`] };
  }

  const source = readFileSync(path, "utf8");
  for (const heading of LOI_SIGNED_ERA146_DOC_REQUIRED_HEADINGS) {
    if (!source.includes(heading)) {
      failures.push(`missing heading: ${heading}`);
    }
  }

  const postStepCount = LOI_SIGNED_ERA146_POST_SIGNATURE_STEPS.filter((step) =>
    source.includes(step),
  ).length;
  if (postStepCount !== LOI_SIGNED_ERA146_POST_SIGNATURE_STEPS.length) {
    failures.push(
      `post-signature steps ${postStepCount}/${LOI_SIGNED_ERA146_POST_SIGNATURE_STEPS.length}`,
    );
  }

  const lower = source.toLowerCase();
  for (const phrase of LOI_SIGNED_ERA146_FORBIDDEN_CLAIMS) {
    if (lower.includes(phrase)) {
      failures.push(`forbidden claim: ${phrase}`);
    }
  }

  return { ok: failures.length === 0, failures };
}

export function auditLoiSignedEra146Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of LOI_SIGNED_ERA146_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const docAudit = auditLoiSignedDocContent(root);
  if (!docAudit.ok) {
    failures.push(...docAudit.failures);
  }

  return { ok: failures.length === 0, failures };
}

export function readPilotGonoGoOverall(root: string = process.cwd()): string | null {
  const path = join(root, "artifacts/pilot-gono-go-summary.json");
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { decision?: string };
    return parsed.decision ?? null;
  } catch {
    return null;
  }
}

export function resolveLoiSignedEra146ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): LoiSignedEra146ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildLoiSignedEra146Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): LoiSignedEra146Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const docAudit = auditLoiSignedDocContent(root);
  const pilotGonoGoOverall = readPilotGonoGoOverall(root);

  const proofStatus = resolveLoiSignedEra146ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: LoiSignedEra146Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: LoiSignedEra146Step[] = [
    {
      id: "wiring_audit",
      label: "Signed LOI record → design partner → pilot GO/NO-GO wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 146 first design partner LOI signed cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "loi_doc_audit",
      label: "Canonical signed LOI doc (era73)",
      status: docAudit.ok ? "PASSED" : "FAILED",
      reason: docAudit.ok ? undefined : docAudit.failures.join("; "),
    },
    {
      id: "pilot_gono_go_artifact",
      label: "Pilot GO/NO-GO artifact (era17)",
      status:
        pilotGonoGoOverall === "GO"
          ? "PASSED"
          : pilotGonoGoOverall === "NO-GO"
            ? "SKIPPED"
            : "SKIPPED",
      reason:
        pilotGonoGoOverall === "GO"
          ? "Commercial GO decision on file"
          : pilotGonoGoOverall
            ? `pilot-gono-go decision: ${pilotGonoGoOverall} — set PILOT_GONOGO_* env and run npm run smoke:pilot-gono-go`
            : "No pilot-gono-go artifact — set PILOT_GONOGO_* env after countersignature",
    },
  ];

  return {
    version: LOI_SIGNED_ERA146_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    loiDocAuditPassed: docAudit.ok,
    pilotGonoGoOverall,
    capabilities: LOI_SIGNED_ERA146_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo signed LOI record + wiring — commercial GO requires PILOT_GONOGO_* env + smoke:pilot-gono-go.",
  };
}

export function formatLoiSignedEra146ReportLines(summary: LoiSignedEra146Summary): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `LOI doc audit: ${summary.loiDocAuditPassed ? "PASSED" : "FAILED"}`,
    `Pilot GO/NO-GO: ${summary.pilotGonoGoOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
