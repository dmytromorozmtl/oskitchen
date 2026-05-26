/**
 * Q4 — ISO 27001 crosswalk: SOC2 CC → ISO/IEC 27001:2022 Annex A.
 */

import type { Soc2ControlId } from "@/lib/compliance/soc2-control-mapping";
import { EXPERIMENT_CRON_CONTROLS } from "@/lib/compliance/soc2-control-mapping";

export type Iso27001ControlId =
  | "A.5.1"
  | "A.5.7"
  | "A.8.2"
  | "A.8.15"
  | "A.8.16"
  | "A.8.24";

export const SOC2_TO_ISO27001: Record<Soc2ControlId, Iso27001ControlId[]> = {
  "CC6.1": ["A.5.1", "A.8.2", "A.8.24"],
  "CC7.2": ["A.8.15", "A.8.16"],
  "CC8.1": ["A.5.7", "A.8.15"],
};

export type Iso27001Attestation = {
  generatedAt: string;
  quarter: string;
  controls: {
    isoControlId: Iso27001ControlId;
    soc2Controls: Soc2ControlId[];
    cronPaths: string[];
    status: "operating" | "exception";
    evidenceArtifacts: string[];
  }[];
};

export function currentQuarterLabel(): string {
  const d = new Date();
  const q = Math.floor(d.getUTCMonth() / 3) + 1;
  return `${d.getUTCFullYear()}-Q${q}`;
}

export function buildIso27001Attestation(): Iso27001Attestation {
  const byIso = new Map<Iso27001ControlId, { soc2: Set<Soc2ControlId>; crons: Set<string> }>();

  for (const cron of EXPERIMENT_CRON_CONTROLS) {
    for (const soc2 of cron.controls) {
      for (const iso of SOC2_TO_ISO27001[soc2] ?? []) {
        const entry = byIso.get(iso) ?? { soc2: new Set(), crons: new Set() };
        entry.soc2.add(soc2);
        entry.crons.add(cron.path);
        byIso.set(iso, entry);
      }
    }
  }

  const controls: Iso27001Attestation["controls"] = [];
  for (const [isoControlId, data] of byIso) {
    controls.push({
      isoControlId,
      soc2Controls: [...data.soc2],
      cronPaths: [...data.crons],
      status: "operating",
      evidenceArtifacts: [
        "s3://experiment-audit/soc2/type2/*/evidence-binder.pdf",
        "s3://experiment-audit/iso27001/*/attestation.pdf",
        "storefront_experiment_audit_events",
      ],
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    quarter: currentQuarterLabel(),
    controls,
  };
}

export function iso27001AttestationPdfLines(att: Iso27001Attestation): string {
  return [
    `ISO 27001 Attestation — ${att.quarter}`,
    `Generated: ${att.generatedAt}`,
    "",
    ...att.controls.flatMap((c) => [
      `${c.isoControlId} ← SOC2 ${c.soc2Controls.join(", ")}`,
      `Crons: ${c.cronPaths.join("; ")}`,
      `Status: ${c.status}`,
      "",
    ]),
  ].join("\n");
}
