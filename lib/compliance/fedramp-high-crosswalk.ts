/**
 * S3 — FedRAMP High P-ATO crosswalk from SOC2 / ISO 27001 + continuous monitoring.
 */

import { buildIso27001Attestation } from "@/lib/compliance/iso27001-crosswalk";
import { buildSoc2Type2EvidenceBinder } from "@/lib/compliance/soc2-control-mapping";
import { EXPERIMENT_CRON_CONTROLS } from "@/lib/compliance/soc2-control-mapping";

export type FedRampHighControlId =
  | "AC-2"
  | "AC-3"
  | "AU-2"
  | "AU-6"
  | "CM-2"
  | "SC-7"
  | "SI-4";

export const SOC2_TO_FEDRAMP_HIGH: Record<string, FedRampHighControlId[]> = {
  "CC6.1": ["AC-2", "AC-3"],
  "CC7.2": ["AU-2", "AU-6", "SI-4"],
  "CC8.1": ["CM-2"],
};

export const ISO_TO_FEDRAMP_HIGH: Record<string, FedRampHighControlId[]> = {
  "A.8.15": ["SC-7"],
  "A.8.16": ["SI-4"],
};

export type FedRampHighMonitoringEvidence = {
  generatedAt: string;
  period: string;
  pAtoReady: boolean;
  controls: {
    controlId: FedRampHighControlId;
    mappedFrom: string[];
    cronPaths: string[];
    continuousMonitoring: "pass" | "fail" | "partial";
    evidenceArtifacts: string[];
  }[];
};

export function isFedRampHighEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_FEDRAMP_HIGH === "1";
}

export function buildFedRampHighMonitoringEvidence(): FedRampHighMonitoringEvidence {
  const iso = buildIso27001Attestation();
  const soc2 = buildSoc2Type2EvidenceBinder();
  const now = new Date();
  const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  const byFr = new Map<FedRampHighControlId, { mapped: Set<string>; crons: Set<string> }>();

  for (const c of soc2.controls) {
    for (const fr of SOC2_TO_FEDRAMP_HIGH[c.controlId] ?? []) {
      const e = byFr.get(fr) ?? { mapped: new Set(), crons: new Set() };
      e.mapped.add(`SOC2:${c.controlId}`);
      c.cronPaths.forEach((p) => e.crons.add(p));
      byFr.set(fr, e);
    }
  }

  for (const c of iso.controls) {
    for (const fr of ISO_TO_FEDRAMP_HIGH[c.isoControlId] ?? []) {
      const e = byFr.get(fr) ?? { mapped: new Set(), crons: new Set() };
      e.mapped.add(`ISO:${c.isoControlId}`);
      c.cronPaths.forEach((p) => e.crons.add(p));
      byFr.set(fr, e);
    }
  }

  const controls: FedRampHighMonitoringEvidence["controls"] = [];
  for (const [controlId, data] of byFr) {
    controls.push({
      controlId,
      mappedFrom: [...data.mapped],
      cronPaths: [...data.crons],
      continuousMonitoring: data.crons.size >= 2 ? "pass" : "partial",
      evidenceArtifacts: [
        "s3://experiment-audit/fedramp-high/monitoring.json",
        "storefront_experiment_audit_events",
      ],
    });
  }

  const pAtoReady = controls.every((c) => c.continuousMonitoring === "pass");

  return {
    generatedAt: now.toISOString(),
    period,
    pAtoReady,
    controls,
  };
}

export function fedRampHighPdfLines(ev: FedRampHighMonitoringEvidence): string {
  return [
    `FedRAMP High Continuous Monitoring — ${ev.period}`,
    `P-ATO ready: ${ev.pAtoReady}`,
    `Crons monitored: ${EXPERIMENT_CRON_CONTROLS.length}`,
    "",
    ...ev.controls.map(
      (c) => `${c.controlId} [${c.continuousMonitoring}] ← ${c.mappedFrom.join(", ")}`,
    ),
  ].join("\n");
}
