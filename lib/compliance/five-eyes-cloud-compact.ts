/**
 * Z3 — Five Eyes cloud compact: AUKUS+ sovereign data residency from Y3 SOCI/GCDO.
 */

import {
  buildSociNzGcdoEvidence,
  isSociNzGcdoEnabled,
  type SociNzGcdoEvidence,
} from "@/lib/compliance/soci-nz-gcdo-crosswalk";

export type FiveEyesMember = "US" | "UK" | "AU" | "CA" | "NZ";

export type AukusResidencyRule = "AU" | "UK" | "US";

export type FiveEyesControlId =
  | "FE-RES-1"
  | "FE-RES-2"
  | "FE-SOV-1"
  | "FE-AUKUS-1";

export type FiveEyesCloudCompactEvidence = {
  generatedAt: string;
  period: string;
  fiveEyesReady: boolean;
  aukusReady: boolean;
  controls: {
    framework: "Five-Eyes" | "AUKUS";
    controlId: string;
    mappedSociGcdo: string[];
    residency: FiveEyesMember[] | AukusResidencyRule[];
    status: "pass" | "partial" | "fail";
  }[];
};

const SOCI_TO_FE: Record<string, FiveEyesControlId[]> = {
  "SOCI-1": ["FE-SOV-1"],
  "SOCI-2": ["FE-RES-1", "FE-RES-2"],
  "SOCI-4": ["FE-RES-2"],
  "SOCI-8": ["FE-AUKUS-1"],
};

const GCDO_TO_FE: Record<string, FiveEyesControlId[]> = {
  "GCDO-1": ["FE-RES-1"],
  "GCDO-2": ["FE-SOV-1"],
  "GCDO-3": ["FE-RES-2"],
  "GCDO-5": ["FE-AUKUS-1"],
};

export function isFiveEyesCloudCompactEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_FIVE_EYES_CLOUD_COMPACT === "1";
}

export function buildFiveEyesCloudCompactEvidence(): FiveEyesCloudCompactEvidence {
  return buildFiveEyesFromSoci(buildSociNzGcdoEvidence());
}

export function buildFiveEyesFromSoci(soci: SociNzGcdoEvidence): FiveEyesCloudCompactEvidence {
  const feMap = new Map<FiveEyesControlId, { mapped: Set<string>; status: "pass" | "partial" | "fail" }>();

  for (const c of soci.controls) {
    const ids = c.framework === "SOCI" ? SOCI_TO_FE[c.controlId] ?? [] : GCDO_TO_FE[c.controlId] ?? [];
    for (const fe of ids) {
      const e = feMap.get(fe) ?? { mapped: new Set(), status: c.status };
      e.mapped.add(`${c.framework}-${c.controlId}`);
      if (c.status === "fail") e.status = "fail";
      else if (c.status === "partial" && e.status === "pass") e.status = "partial";
      feMap.set(fe, e);
    }
  }

  const controls: FiveEyesCloudCompactEvidence["controls"] = [];
  for (const [controlId, data] of feMap) {
    const isAukus = controlId.startsWith("FE-AUKUS");
    controls.push({
      framework: isAukus ? "AUKUS" : "Five-Eyes",
      controlId,
      mappedSociGcdo: [...data.mapped],
      residency: isAukus ? (["AU", "UK", "US"] as AukusResidencyRule[]) : (["US", "UK", "AU", "CA", "NZ"] as FiveEyesMember[]),
      status: data.status,
    });
  }

  const fiveEyesReady = controls.filter((c) => c.framework === "Five-Eyes").every((c) => c.status === "pass");
  const aukusReady = controls.filter((c) => c.framework === "AUKUS").every((c) => c.status === "pass");

  return {
    generatedAt: new Date().toISOString(),
    period: soci.period,
    fiveEyesReady,
    aukusReady,
    controls,
  };
}

export function evaluateFiveEyesCloudCompactGate(_raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isFiveEyesCloudCompactEnabled()) {
    return { passed: true, headline: "Five Eyes compact off", detail: "" };
  }
  if (!isSociNzGcdoEnabled()) {
    return {
      passed: false,
      headline: "SOCI/NZ GCDO required",
      detail: "Enable THEME_EXPERIMENT_SOCI_NZ_GCDO=1 (Y3).",
    };
  }
  const ev = buildFiveEyesCloudCompactEvidence();
  if (!ev.fiveEyesReady) {
    return {
      passed: false,
      headline: "Five Eyes residency not ready",
      detail: "US/UK/AU/CA/NZ sovereign cloud compact incomplete.",
    };
  }
  if (!ev.aukusReady) {
    return {
      passed: false,
      headline: "AUKUS residency not ready",
      detail: "AU/UK/US trilateral data residency attestation incomplete.",
    };
  }
  return {
    passed: true,
    headline: "Five Eyes + AUKUS compact aligned",
    detail: `${ev.controls.length} controls · period ${ev.period}`,
  };
}

export function fiveEyesCloudCompactPdfLines(ev: FiveEyesCloudCompactEvidence): string {
  return [
    `Five Eyes + AUKUS — ${ev.period}`,
    `Five Eyes ready: ${ev.fiveEyesReady}`,
    `AUKUS ready: ${ev.aukusReady}`,
    "",
    ...ev.controls.map(
      (c) => `${c.framework} ${c.controlId} [${c.status}] ← ${c.mappedSociGcdo.join(", ")}`,
    ),
  ].join("\n");
}
