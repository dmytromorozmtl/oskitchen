/**
 * AD1 — Indo-Pacific compact: ASEAN observer + cross-border PQC attestation (AA3 Five Eyes+).
 */

import { createHash } from "node:crypto";
import {
  buildFiveEyesPlusCompactEvidence,
  isFiveEyesPlusCompactEnabled,
  type FiveEyesPlusCompactEvidence,
} from "@/lib/compliance/five-eyes-plus-compact";
import { isPqcDnaArchivalEnabled, readPqcDnaArchival } from "@/lib/compliance/pqc-dna-archival";

export type AseanObserverNation = "SG" | "MY" | "TH" | "VN" | "ID" | "PH";

export type IndoPacificControlId = "IP-ASEAN-1" | "IP-CROSS-1" | "IP-PQC-1";

export type IndoPacificCompactEvidence = {
  generatedAt: string;
  period: string;
  indoPacificReady: boolean;
  aseanObserverReady: boolean;
  crossBorderPqcReady: boolean;
  crossBorderPqcHash: string | null;
  observers: AseanObserverNation[];
  controls: {
    framework: "Indo-Pacific" | "ASEAN-Observer";
    controlId: string;
    observers?: AseanObserverNation[];
    status: "pass" | "partial" | "fail";
    mappedFiveEyesPlus: string[];
  }[];
};

export type IndoPacificCompactSnapshot = {
  at: string;
  evidence: IndoPacificCompactEvidence;
  lastAttestationAt: string | null;
};

export function isIndoPacificCompactEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_INDO_PACIFIC_COMPACT === "1";
}

export function aseanObserverNations(): AseanObserverNation[] {
  const raw = process.env.THEME_EXPERIMENT_ASEAN_OBSERVER_NATIONS?.trim();
  if (!raw) return ["SG", "MY", "TH"];
  return raw.split(",").map((s) => s.trim().toUpperCase()) as AseanObserverNation[];
}

export function buildCrossBorderPqcAttestation(chainSealed: boolean, fePlusHash: string | null): string {
  return createHash("sha3-256")
    .update(
      `ip-cross-pqc:${chainSealed}:${fePlusHash ?? "none"}:${process.env.THEME_EXPERIMENT_PQC_DNA_ALGORITHM ?? "ML-DSA-65"}`,
    )
    .digest("hex");
}

export function buildIndoPacificFromFiveEyesPlus(
  fePlus: FiveEyesPlusCompactEvidence,
  crossBorderHash: string | null,
  observers: AseanObserverNation[],
): IndoPacificCompactEvidence {
  const mapped = fePlus.controls.map((c) => `${c.framework}-${c.controlId}`);
  const controls: IndoPacificCompactEvidence["controls"] = [
    {
      framework: "ASEAN-Observer",
      controlId: "IP-ASEAN-1",
      observers,
      status: fePlus.observersReady && fePlus.fiveEyesPlusReady ? "pass" : "partial",
      mappedFiveEyesPlus: mapped,
    },
    {
      framework: "Indo-Pacific",
      controlId: "IP-CROSS-1",
      status: crossBorderHash ? "pass" : "fail",
      mappedFiveEyesPlus: mapped.filter((m) => m.includes("Observer")),
    },
    {
      framework: "Indo-Pacific",
      controlId: "IP-PQC-1",
      status: fePlus.quantumSafeResidencyReady && crossBorderHash ? "pass" : "partial",
      mappedFiveEyesPlus: mapped,
    },
  ];

  const aseanObserverReady = controls
    .filter((c) => c.controlId === "IP-ASEAN-1")
    .every((c) => c.status === "pass");
  const crossBorderPqcReady = controls.some(
    (c) => c.controlId === "IP-PQC-1" && c.status === "pass",
  );
  const indoPacificReady =
    fePlus.fiveEyesPlusReady && aseanObserverReady && crossBorderPqcReady;

  return {
    generatedAt: new Date().toISOString(),
    period: fePlus.period,
    indoPacificReady,
    aseanObserverReady,
    crossBorderPqcReady,
    crossBorderPqcHash: crossBorderHash,
    observers,
    controls,
  };
}

export function readIndoPacificCompact(raw: unknown): IndoPacificCompactSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).indoPacificCompact;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  const ev = s.evidence;
  if (!ev || typeof ev !== "object") return null;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    evidence: ev as IndoPacificCompactEvidence,
    lastAttestationAt: typeof s.lastAttestationAt === "string" ? s.lastAttestationAt : null,
  };
}

export function mergeIndoPacificCompact(
  previousRaw: unknown,
  snap: IndoPacificCompactSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.indoPacificCompact = snap;
  return base;
}

export function buildIndoPacificCompactEvidence(raw?: unknown): IndoPacificCompactEvidence {
  const fePlus = buildFiveEyesPlusCompactEvidence(raw);
  const pqc = raw ? readPqcDnaArchival(raw) : null;
  const crossBorderHash =
    isPqcDnaArchivalEnabled() && pqc?.chainSealed
      ? buildCrossBorderPqcAttestation(true, fePlus.quantumSafeProofHash)
      : isPqcDnaArchivalEnabled()
        ? buildCrossBorderPqcAttestation(false, fePlus.quantumSafeProofHash)
        : null;
  return buildIndoPacificFromFiveEyesPlus(fePlus, crossBorderHash, aseanObserverNations());
}

export function attestIndoPacificCompact(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: IndoPacificCompactSnapshot;
} {
  const evidence = buildIndoPacificCompactEvidence(previousRaw);
  const snap: IndoPacificCompactSnapshot = {
    at: new Date().toISOString(),
    evidence,
    lastAttestationAt: new Date().toISOString(),
  };
  return { json: mergeIndoPacificCompact(previousRaw, snap), snap };
}

export function evaluateIndoPacificCompactGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isIndoPacificCompactEnabled()) {
    return { passed: true, headline: "Indo-Pacific compact off", detail: "" };
  }
  if (!isFiveEyesPlusCompactEnabled()) {
    return {
      passed: false,
      headline: "Five Eyes+ compact required",
      detail: "Enable THEME_EXPERIMENT_FIVE_EYES_PLUS_COMPACT=1 (AA3).",
    };
  }
  const ev = buildIndoPacificCompactEvidence(raw);
  if (!ev.aseanObserverReady) {
    return {
      passed: false,
      headline: "ASEAN observer quorum not ready",
      detail: `Observers ${ev.observers.join("/")} require Five Eyes+ baseline.`,
    };
  }
  if (!ev.crossBorderPqcReady) {
    return {
      passed: false,
      headline: "Cross-border PQC attestation missing",
      detail: "Seal PQC DNA chain for Indo-Pacific cross-border proof.",
    };
  }
  if (!ev.indoPacificReady) {
    return {
      passed: false,
      headline: "Indo-Pacific compact incomplete",
      detail: "Resolve ASEAN observer or cross-border controls.",
    };
  }
  return {
    passed: true,
    headline: "Indo-Pacific compact aligned",
    detail: `ASEAN ${ev.observers.join("/")} · cross-border ${ev.crossBorderPqcHash?.slice(0, 12) ?? "—"}…`,
  };
}

export function indoPacificCompactPdfLines(ev: IndoPacificCompactEvidence): string[] {
  return [
    `Indo-Pacific — ${ev.period}`,
    `Ready: ${ev.indoPacificReady}`,
    `ASEAN observers: ${ev.aseanObserverReady}`,
    `Cross-border PQC: ${ev.crossBorderPqcReady}`,
    "",
    ...ev.controls.map(
      (c) =>
        `${c.framework} ${c.controlId} [${c.status}]${c.observers ? ` (${c.observers.join("/")})` : ""}`,
    ),
  ];
}
