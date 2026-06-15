/**
 * X3 — PSPF (AU Protective Security) + NZ DTA crosswalk from W3 ISMAP/NZISM.
 */

import {
  buildIsmapNzismEvidence,
  isIsmapNzismEnabled,
  type IsmapNzismEvidence,
} from "@/lib/compliance/ismap-nzism-crosswalk";

export type PspfCoreRequirement =
  | "PSPF-GOV-1"
  | "PSPF-INFOSEC-1"
  | "PSPF-PHYSEC-1"
  | "PSPF-PERSSEC-1";

export type NzDtaPrinciple = "DTA-1" | "DTA-2" | "DTA-4" | "DTA-8";

export type PspfNzDtaEvidence = {
  generatedAt: string;
  period: string;
  pspfReady: boolean;
  nzDtaReady: boolean;
  controls: {
    framework: "PSPF" | "NZ-DTA";
    controlId: string;
    mappedIsmapNzism: string[];
    status: "pass" | "partial" | "fail";
  }[];
};

const ISMAP_TO_PSPF: Record<string, PspfCoreRequirement[]> = {
  "ISMAP-AC-1": ["PSPF-GOV-1", "PSPF-INFOSEC-1"],
  "ISMAP-AU-1": ["PSPF-INFOSEC-1"],
  "ISMAP-SC-1": ["PSPF-PHYSEC-1"],
  "ISMAP-SI-1": ["PSPF-INFOSEC-1", "PSPF-PERSSEC-1"],
};

const NZISM_TO_DTA: Record<string, NzDtaPrinciple[]> = {
  "NZISM-1": ["DTA-1", "DTA-2"],
  "NZISM-2": ["DTA-4"],
  "NZISM-4": ["DTA-4", "DTA-8"],
  "NZISM-10": ["DTA-8"],
};

export function isPspfNzDtaEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_PSPF_NZ_DTA === "1";
}

export function buildPspfNzDtaEvidence(): PspfNzDtaEvidence {
  const ismap = buildIsmapNzismEvidence();
  return buildPspfNzDtaFromIsmap(ismap);
}

export function buildPspfNzDtaFromIsmap(ismap: IsmapNzismEvidence): PspfNzDtaEvidence {
  const pspfMap = new Map<PspfCoreRequirement, { mapped: Set<string>; status: "pass" | "partial" | "fail" }>();
  const dtaMap = new Map<NzDtaPrinciple, { mapped: Set<string>; status: "pass" | "partial" | "fail" }>();

  for (const c of ismap.controls) {
    if (c.framework === "ISMAP") {
      for (const pspf of ISMAP_TO_PSPF[c.controlId] ?? []) {
        const e = pspfMap.get(pspf) ?? { mapped: new Set(), status: c.continuousMonitoring };
        e.mapped.add(c.controlId);
        if (c.continuousMonitoring === "fail") e.status = "fail";
        else if (c.continuousMonitoring === "partial" && e.status === "pass") e.status = "partial";
        pspfMap.set(pspf, e);
      }
    }
    if (c.framework === "NZISM") {
      for (const dta of NZISM_TO_DTA[c.controlId] ?? []) {
        const e = dtaMap.get(dta) ?? { mapped: new Set(), status: c.continuousMonitoring };
        e.mapped.add(c.controlId);
        if (c.continuousMonitoring === "fail") e.status = "fail";
        else if (c.continuousMonitoring === "partial" && e.status === "pass") e.status = "partial";
        dtaMap.set(dta, e);
      }
    }
  }

  const controls: PspfNzDtaEvidence["controls"] = [];
  for (const [controlId, data] of pspfMap) {
    controls.push({
      framework: "PSPF",
      controlId,
      mappedIsmapNzism: [...data.mapped],
      status: data.status,
    });
  }
  for (const [controlId, data] of dtaMap) {
    controls.push({
      framework: "NZ-DTA",
      controlId,
      mappedIsmapNzism: [...data.mapped],
      status: data.status,
    });
  }

  const pspfReady = controls.filter((c) => c.framework === "PSPF").every((c) => c.status === "pass");
  const nzDtaReady = controls.filter((c) => c.framework === "NZ-DTA").every((c) => c.status === "pass");

  return {
    generatedAt: new Date().toISOString(),
    period: ismap.period,
    pspfReady,
    nzDtaReady,
    controls,
  };
}

export function evaluatePspfNzDtaPublishGate(_raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isPspfNzDtaEnabled()) {
    return { passed: true, headline: "PSPF/NZ DTA off", detail: "" };
  }
  if (!isIsmapNzismEnabled()) {
    return {
      passed: false,
      headline: "ISMAP/NZISM required",
      detail: "Enable THEME_EXPERIMENT_ISMAP_NZISM=1 (W3).",
    };
  }
  const ev = buildPspfNzDtaEvidence();
  if (!ev.pspfReady) {
    return {
      passed: false,
      headline: "PSPF core requirements not ready",
      detail: "AU Protective Security Policy Framework crosswalk incomplete.",
    };
  }
  if (!ev.nzDtaReady) {
    return {
      passed: false,
      headline: "NZ DTA principles not ready",
      detail: "NZ Data & Analytics crosswalk incomplete.",
    };
  }
  return {
    passed: true,
    headline: "PSPF + NZ DTA aligned",
    detail: `${ev.controls.length} controls · period ${ev.period}`,
  };
}

export function pspfNzDtaPdfLines(ev: PspfNzDtaEvidence): string {
  return [
    `PSPF + NZ DTA — ${ev.period}`,
    `PSPF ready: ${ev.pspfReady}`,
    `NZ DTA ready: ${ev.nzDtaReady}`,
    "",
    ...ev.controls.map(
      (c) => `${c.framework} ${c.controlId} [${c.status}] ← ${c.mappedIsmapNzism.join(", ")}`,
    ),
  ].join("\n");
}
