/**
 * Y3 — AU SOCI + NZ GCDO sovereign cloud operating model crosswalk from X3 PSPF/NZ DTA.
 */

import {
  buildPspfNzDtaEvidence,
  isPspfNzDtaEnabled,
  type PspfNzDtaEvidence,
} from "@/lib/compliance/pspf-nz-dta-crosswalk";

export type SociPrinciple = "SOCI-1" | "SOCI-2" | "SOCI-4" | "SOCI-8";

export type NzGcdoRequirement = "GCDO-1" | "GCDO-2" | "GCDO-3" | "GCDO-5";

export type SociNzGcdoEvidence = {
  generatedAt: string;
  period: string;
  sociReady: boolean;
  nzGcdoReady: boolean;
  controls: {
    framework: "SOCI" | "NZ-GCDO";
    controlId: string;
    mappedPspfDta: string[];
    status: "pass" | "partial" | "fail";
  }[];
};

const PSPF_TO_SOCI: Record<string, SociPrinciple[]> = {
  "PSPF-GOV-1": ["SOCI-1"],
  "PSPF-INFOSEC-1": ["SOCI-2", "SOCI-4"],
  "PSPF-PHYSEC-1": ["SOCI-8"],
  "PSPF-PERSSEC-1": ["SOCI-1", "SOCI-2"],
};

const DTA_TO_GCDO: Record<string, NzGcdoRequirement[]> = {
  "DTA-1": ["GCDO-1"],
  "DTA-2": ["GCDO-2"],
  "DTA-4": ["GCDO-3"],
  "DTA-8": ["GCDO-5"],
};

export function isSociNzGcdoEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_SOCI_NZ_GCDO === "1";
}

export function buildSociNzGcdoEvidence(): SociNzGcdoEvidence {
  return buildSociNzGcdoFromPspf(buildPspfNzDtaEvidence());
}

export function buildSociNzGcdoFromPspf(pspf: PspfNzDtaEvidence): SociNzGcdoEvidence {
  const sociMap = new Map<SociPrinciple, { mapped: Set<string>; status: "pass" | "partial" | "fail" }>();
  const gcdoMap = new Map<NzGcdoRequirement, { mapped: Set<string>; status: "pass" | "partial" | "fail" }>();

  for (const c of pspf.controls) {
    if (c.framework === "PSPF") {
      for (const soci of PSPF_TO_SOCI[c.controlId] ?? []) {
        const e = sociMap.get(soci) ?? { mapped: new Set(), status: c.status };
        e.mapped.add(c.controlId);
        if (c.status === "fail") e.status = "fail";
        else if (c.status === "partial" && e.status === "pass") e.status = "partial";
        sociMap.set(soci, e);
      }
    }
    if (c.framework === "NZ-DTA") {
      for (const gcdo of DTA_TO_GCDO[c.controlId] ?? []) {
        const e = gcdoMap.get(gcdo) ?? { mapped: new Set(), status: c.status };
        e.mapped.add(c.controlId);
        if (c.status === "fail") e.status = "fail";
        else if (c.status === "partial" && e.status === "pass") e.status = "partial";
        gcdoMap.set(gcdo, e);
      }
    }
  }

  const controls: SociNzGcdoEvidence["controls"] = [];
  for (const [controlId, data] of sociMap) {
    controls.push({
      framework: "SOCI",
      controlId,
      mappedPspfDta: [...data.mapped],
      status: data.status,
    });
  }
  for (const [controlId, data] of gcdoMap) {
    controls.push({
      framework: "NZ-GCDO",
      controlId,
      mappedPspfDta: [...data.mapped],
      status: data.status,
    });
  }

  const sociReady = controls.filter((c) => c.framework === "SOCI").every((c) => c.status === "pass");
  const nzGcdoReady = controls
    .filter((c) => c.framework === "NZ-GCDO")
    .every((c) => c.status === "pass");

  return {
    generatedAt: new Date().toISOString(),
    period: pspf.period,
    sociReady,
    nzGcdoReady,
    controls,
  };
}

export function evaluateSociNzGcdoPublishGate(_raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isSociNzGcdoEnabled()) {
    return { passed: true, headline: "SOCI/NZ GCDO off", detail: "" };
  }
  if (!isPspfNzDtaEnabled()) {
    return {
      passed: false,
      headline: "PSPF/NZ DTA required",
      detail: "Enable THEME_EXPERIMENT_PSPF_NZ_DTA=1 (X3).",
    };
  }
  const ev = buildSociNzGcdoEvidence();
  if (!ev.sociReady) {
    return {
      passed: false,
      headline: "AU SOCI not ready",
      detail: "Security of Critical Infrastructure crosswalk incomplete.",
    };
  }
  if (!ev.nzGcdoReady) {
    return {
      passed: false,
      headline: "NZ GCDO not ready",
      detail: "Government Chief Digital Officer sovereign cloud model incomplete.",
    };
  }
  return {
    passed: true,
    headline: "SOCI + NZ GCDO aligned",
    detail: `${ev.controls.length} controls · period ${ev.period}`,
  };
}

export function sociNzGcdoPdfLines(ev: SociNzGcdoEvidence): string {
  return [
    `SOCI + NZ GCDO — ${ev.period}`,
    `SOCI ready: ${ev.sociReady}`,
    `NZ GCDO ready: ${ev.nzGcdoReady}`,
    "",
    ...ev.controls.map(
      (c) => `${c.framework} ${c.controlId} [${c.status}] ← ${c.mappedPspfDta.join(", ")}`,
    ),
  ].join("\n");
}
