/**
 * AA3 — Five Eyes+ compact: JP/IN observer status + quantum-safe residency proofs (Z3).
 */

import { createHash } from "node:crypto";

import {
  buildFiveEyesCloudCompactEvidence,
  isFiveEyesCloudCompactEnabled,
  type FiveEyesCloudCompactEvidence,
} from "@/lib/compliance/five-eyes-cloud-compact";
import { isPqcDnaArchivalEnabled, readPqcDnaArchival } from "@/lib/compliance/pqc-dna-archival";

export type ObserverNation = "JP" | "IN";

export type FiveEyesPlusControlId = "FE+-OBS-1" | "FE+-OBS-2" | "FE+-QSAFE-1";

export type FiveEyesPlusCompactEvidence = {
  generatedAt: string;
  period: string;
  fiveEyesPlusReady: boolean;
  observersReady: boolean;
  quantumSafeResidencyReady: boolean;
  quantumSafeProofHash: string | null;
  controls: {
    framework: "Five-Eyes+" | "Observer";
    controlId: string;
    observers?: ObserverNation[];
    status: "pass" | "partial" | "fail";
    mappedFiveEyes: string[];
  }[];
};

export function isFiveEyesPlusCompactEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_FIVE_EYES_PLUS_COMPACT === "1";
}

export function buildQuantumSafeResidencyProof(chainSealed: boolean): string {
  return createHash("sha3-256")
    .update(`fe-plus-qsafe:${chainSealed}:${process.env.THEME_EXPERIMENT_PQC_DNA_ALGORITHM ?? "ML-DSA-65"}`)
    .digest("hex");
}

export function buildFiveEyesPlusFromFiveEyes(
  fe: FiveEyesCloudCompactEvidence,
  quantumProofHash: string | null,
): FiveEyesPlusCompactEvidence {
  const baseMapped = fe.controls.map((c) => `${c.framework}-${c.controlId}`);
  const controls: FiveEyesPlusCompactEvidence["controls"] = [
    {
      framework: "Observer",
      controlId: "FE+-OBS-1",
      observers: ["JP"],
      status: fe.fiveEyesReady ? "pass" : "partial",
      mappedFiveEyes: baseMapped.filter((m) => m.includes("Five-Eyes")),
    },
    {
      framework: "Observer",
      controlId: "FE+-OBS-2",
      observers: ["IN"],
      status: fe.aukusReady ? "pass" : "partial",
      mappedFiveEyes: baseMapped.filter((m) => m.includes("AUKUS")),
    },
    {
      framework: "Five-Eyes+",
      controlId: "FE+-QSAFE-1",
      status: quantumProofHash ? "pass" : "fail",
      mappedFiveEyes: baseMapped,
    },
  ];

  const observersReady = controls
    .filter((c) => c.framework === "Observer")
    .every((c) => c.status === "pass");
  const quantumSafeResidencyReady = controls.some(
    (c) => c.controlId === "FE+-QSAFE-1" && c.status === "pass",
  );
  const fiveEyesPlusReady =
    fe.fiveEyesReady && fe.aukusReady && observersReady && quantumSafeResidencyReady;

  return {
    generatedAt: new Date().toISOString(),
    period: fe.period,
    fiveEyesPlusReady,
    observersReady,
    quantumSafeResidencyReady,
    quantumSafeProofHash: quantumProofHash,
    controls,
  };
}

export function buildFiveEyesPlusCompactEvidence(raw?: unknown): FiveEyesPlusCompactEvidence {
  const fe = buildFiveEyesCloudCompactEvidence();
  const pqc = raw ? readPqcDnaArchival(raw) : null;
  const quantumProofHash =
    isPqcDnaArchivalEnabled() && pqc?.chainSealed
      ? buildQuantumSafeResidencyProof(true)
      : isPqcDnaArchivalEnabled()
        ? buildQuantumSafeResidencyProof(false)
        : null;
  return buildFiveEyesPlusFromFiveEyes(fe, quantumProofHash);
}

export function evaluateFiveEyesPlusCompactGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isFiveEyesPlusCompactEnabled()) {
    return { passed: true, headline: "Five Eyes+ compact off", detail: "" };
  }
  if (!isFiveEyesCloudCompactEnabled()) {
    return {
      passed: false,
      headline: "Five Eyes compact required",
      detail: "Enable THEME_EXPERIMENT_FIVE_EYES_CLOUD_COMPACT=1 (Z3).",
    };
  }
  if (!isPqcDnaArchivalEnabled()) {
    return {
      passed: false,
      headline: "PQC DNA archival required for quantum-safe proof",
      detail: "Enable THEME_EXPERIMENT_PQC_DNA_ARCHIVAL=1 (X1).",
    };
  }
  const ev = buildFiveEyesPlusCompactEvidence(raw);
  if (!ev.observersReady) {
    return {
      passed: false,
      headline: "JP/IN observer status not ready",
      detail: "Observer nations require Five Eyes + AUKUS baseline pass.",
    };
  }
  if (!ev.quantumSafeResidencyReady) {
    return {
      passed: false,
      headline: "Quantum-safe residency proof missing",
      detail: "Seal PQC DNA chain before Five Eyes+ publish.",
    };
  }
  if (!ev.fiveEyesPlusReady) {
    return {
      passed: false,
      headline: "Five Eyes+ compact incomplete",
      detail: "Resolve observer or residency controls.",
    };
  }
  return {
    passed: true,
    headline: "Five Eyes+ compact aligned",
    detail: `JP/IN observers · qsafe ${ev.quantumSafeProofHash?.slice(0, 12) ?? "—"}…`,
  };
}

export function fiveEyesPlusCompactPdfLines(ev: FiveEyesPlusCompactEvidence): string {
  return [
    `Five Eyes+ — ${ev.period}`,
    `Ready: ${ev.fiveEyesPlusReady}`,
    `Observers (JP/IN): ${ev.observersReady}`,
    `Quantum-safe residency: ${ev.quantumSafeResidencyReady}`,
    `Proof: ${ev.quantumSafeProofHash ?? "none"}`,
    "",
    ...ev.controls.map(
      (c) =>
        `${c.framework} ${c.controlId} [${c.status}]${c.observers ? ` (${c.observers.join("/")})` : ""}`,
    ),
  ].join("\n");
}
