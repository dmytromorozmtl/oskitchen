/**
 * T3 — CMMC Level 3 crosswalk: FedRAMP High (S3) + NIST 800-171 → CMMC practices.
 */

import {
  buildFedRampHighMonitoringEvidence,
  type FedRampHighControlId,
} from "@/lib/compliance/fedramp-high-crosswalk";

export type CmmcPracticeId =
  | "AC.L2-3.1.1"
  | "AC.L2-3.1.2"
  | "AU.L2-3.3.1"
  | "AU.L2-3.3.2"
  | "CM.L2-3.4.1"
  | "SC.L2-3.13.1"
  | "SI.L2-3.14.1";

export const FEDRAMP_TO_CMMC_L3: Record<FedRampHighControlId, CmmcPracticeId[]> = {
  "AC-2": ["AC.L2-3.1.1", "AC.L2-3.1.2"],
  "AC-3": ["AC.L2-3.1.2"],
  "AU-2": ["AU.L2-3.3.1"],
  "AU-6": ["AU.L2-3.3.2"],
  "CM-2": ["CM.L2-3.4.1"],
  "SC-7": ["SC.L2-3.13.1"],
  "SI-4": ["SI.L2-3.14.1"],
};

export const NIST_800_171_REFS: Record<CmmcPracticeId, string> = {
  "AC.L2-3.1.1": "3.1.1",
  "AC.L2-3.1.2": "3.1.2",
  "AU.L2-3.3.1": "3.3.1",
  "AU.L2-3.3.2": "3.3.2",
  "CM.L2-3.4.1": "3.4.1",
  "SC.L2-3.13.1": "3.13.1",
  "SI.L2-3.14.1": "3.14.7",
};

export type CmmcL3MonitoringEvidence = {
  generatedAt: string;
  period: string;
  level: "CMMC_L3";
  dodContractorReady: boolean;
  practices: {
    practiceId: CmmcPracticeId;
    nist800171: string;
    mappedFedRamp: FedRampHighControlId[];
    continuousMonitoring: "pass" | "partial" | "fail";
    evidenceArtifacts: string[];
  }[];
};

export function isCmmcL3Enabled(): boolean {
  return process.env.THEME_EXPERIMENT_CMMC_L3 === "1";
}

export function buildCmmcL3MonitoringEvidence(): CmmcL3MonitoringEvidence {
  const fed = buildFedRampHighMonitoringEvidence();
  const byPractice = new Map<
    CmmcPracticeId,
    { fedRamp: Set<FedRampHighControlId>; monitoring: "pass" | "partial" | "fail" }
  >();

  for (const c of fed.controls) {
    for (const pr of FEDRAMP_TO_CMMC_L3[c.controlId] ?? []) {
      const e = byPractice.get(pr) ?? { fedRamp: new Set(), monitoring: c.continuousMonitoring };
      e.fedRamp.add(c.controlId);
      if (c.continuousMonitoring === "fail") e.monitoring = "fail";
      else if (c.continuousMonitoring === "partial" && e.monitoring === "pass") {
        e.monitoring = "partial";
      }
      byPractice.set(pr, e);
    }
  }

  const practices: CmmcL3MonitoringEvidence["practices"] = [];
  for (const [practiceId, data] of byPractice) {
    practices.push({
      practiceId,
      nist800171: NIST_800_171_REFS[practiceId],
      mappedFedRamp: [...data.fedRamp],
      continuousMonitoring: data.monitoring,
      evidenceArtifacts: [
        "s3://experiment-audit/cmmc-l3/monitoring.json",
        `fedramp-high/${fed.period}/monitoring.json`,
      ],
    });
  }

  const dodContractorReady = practices.every((p) => p.continuousMonitoring === "pass");

  return {
    generatedAt: new Date().toISOString(),
    period: fed.period,
    level: "CMMC_L3",
    dodContractorReady,
    practices,
  };
}

export function cmmcL3PdfLines(ev: CmmcL3MonitoringEvidence): string {
  return [
    `CMMC Level 3 Continuous Monitoring — ${ev.period}`,
    `DoD contractor ready: ${ev.dodContractorReady}`,
    "",
    ...ev.practices.map(
      (p) => `${p.practiceId} [${p.continuousMonitoring}] NIST ${p.nist800171} ← ${p.mappedFedRamp.join(", ")}`,
    ),
  ].join("\n");
}
