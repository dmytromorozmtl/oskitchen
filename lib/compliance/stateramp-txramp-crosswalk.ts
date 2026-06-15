/**
 * U3 — StateRAMP + TX-RAMP crosswalk from CMMC Level 3 (T3) for state / Texas cloud procurement.
 */

import {
  buildCmmcL3MonitoringEvidence,
  type CmmcPracticeId,
} from "@/lib/compliance/cmmc-l3-crosswalk";

export type StateRampControlId = "SR-AC-1" | "SR-AU-1" | "SR-CM-1" | "SR-SC-1" | "SR-SI-1";

export type TxRampControlId = "TX-AC-1" | "TX-AU-1" | "TX-CM-1" | "TX-SC-1";

export const CMMC_TO_STATERAMP: Record<CmmcPracticeId, StateRampControlId[]> = {
  "AC.L2-3.1.1": ["SR-AC-1"],
  "AC.L2-3.1.2": ["SR-AC-1"],
  "AU.L2-3.3.1": ["SR-AU-1"],
  "AU.L2-3.3.2": ["SR-AU-1"],
  "CM.L2-3.4.1": ["SR-CM-1"],
  "SC.L2-3.13.1": ["SR-SC-1"],
  "SI.L2-3.14.1": ["SR-SI-1"],
};

export const CMMC_TO_TXRAMP: Record<CmmcPracticeId, TxRampControlId[]> = {
  "AC.L2-3.1.1": ["TX-AC-1"],
  "AC.L2-3.1.2": ["TX-AC-1"],
  "AU.L2-3.3.1": ["TX-AU-1"],
  "AU.L2-3.3.2": ["TX-AU-1"],
  "CM.L2-3.4.1": ["TX-CM-1"],
  "SC.L2-3.13.1": ["TX-SC-1"],
  "SI.L2-3.14.1": ["TX-SC-1"],
};

export type StateRampTxRampEvidence = {
  generatedAt: string;
  period: string;
  stateRampReady: boolean;
  txRampReady: boolean;
  controls: {
    framework: "StateRAMP" | "TX-RAMP";
    controlId: string;
    mappedCmmc: CmmcPracticeId[];
    continuousMonitoring: "pass" | "partial" | "fail";
    evidenceArtifacts: string[];
  }[];
};

export function isStateRampTxRampEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_STATERAMP_TXRAMP === "1";
}

export function buildStateRampTxRampEvidence(): StateRampTxRampEvidence {
  const cmmc = buildCmmcL3MonitoringEvidence();
  const controls: StateRampTxRampEvidence["controls"] = [];

  const srMap = new Map<StateRampControlId, { cmmc: Set<CmmcPracticeId>; status: "pass" | "partial" | "fail" }>();
  const txMap = new Map<TxRampControlId, { cmmc: Set<CmmcPracticeId>; status: "pass" | "partial" | "fail" }>();

  for (const p of cmmc.practices) {
    for (const sr of CMMC_TO_STATERAMP[p.practiceId] ?? []) {
      const e = srMap.get(sr) ?? { cmmc: new Set(), status: p.continuousMonitoring };
      e.cmmc.add(p.practiceId);
      if (p.continuousMonitoring === "fail") e.status = "fail";
      else if (p.continuousMonitoring === "partial" && e.status === "pass") e.status = "partial";
      srMap.set(sr, e);
    }
    for (const tx of CMMC_TO_TXRAMP[p.practiceId] ?? []) {
      const e = txMap.get(tx) ?? { cmmc: new Set(), status: p.continuousMonitoring };
      e.cmmc.add(p.practiceId);
      if (p.continuousMonitoring === "fail") e.status = "fail";
      else if (p.continuousMonitoring === "partial" && e.status === "pass") e.status = "partial";
      txMap.set(tx, e);
    }
  }

  for (const [controlId, data] of srMap) {
    controls.push({
      framework: "StateRAMP",
      controlId,
      mappedCmmc: [...data.cmmc],
      continuousMonitoring: data.status,
      evidenceArtifacts: [
        "s3://experiment-audit/stateramp-txramp/monitoring.json",
        `cmmc-l3/${cmmc.period}/monitoring.json`,
      ],
    });
  }
  for (const [controlId, data] of txMap) {
    controls.push({
      framework: "TX-RAMP",
      controlId,
      mappedCmmc: [...data.cmmc],
      continuousMonitoring: data.status,
      evidenceArtifacts: ["s3://experiment-audit/stateramp-txramp/monitoring.json"],
    });
  }

  const stateRampReady = controls
    .filter((c) => c.framework === "StateRAMP")
    .every((c) => c.continuousMonitoring === "pass");
  const txRampReady = controls
    .filter((c) => c.framework === "TX-RAMP")
    .every((c) => c.continuousMonitoring === "pass");

  return {
    generatedAt: new Date().toISOString(),
    period: cmmc.period,
    stateRampReady,
    txRampReady,
    controls,
  };
}

export function stateRampTxRampPdfLines(ev: StateRampTxRampEvidence): string {
  return [
    `StateRAMP + TX-RAMP — ${ev.period}`,
    `StateRAMP ready: ${ev.stateRampReady}`,
    `TX-RAMP ready: ${ev.txRampReady}`,
    "",
    ...ev.controls.map(
      (c) => `${c.framework} ${c.controlId} [${c.continuousMonitoring}] ← ${c.mappedCmmc.join(", ")}`,
    ),
  ].join("\n");
}
