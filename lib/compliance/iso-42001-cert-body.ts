/**
 * Y4 — ISO/IEC 42001 certification body API: external auditor attestations + cert body webhook.
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  isIso42001Stage2Enabled,
  readIso42001Stage2Pack,
} from "@/lib/compliance/iso-42001-stage2";
import { isIso42001AiMsEnabled, readIso42001AiMsPack } from "@/lib/compliance/iso-42001-ai-ms";

export type CertBodyAttestation = {
  at: string;
  attestationId: string;
  certBodyId: string;
  certBodyName: string;
  scope: "ISO/IEC 42001:2023";
  stage: "stage1" | "stage2" | "surveillance";
  verdict: "conformant" | "minor_nc" | "major_nc";
  validUntil: string;
  auditorPortalUrl: string | null;
};

export type Iso42001CertBodyPack = {
  at: string;
  attestations: CertBodyAttestation[];
  latestVerdict: CertBodyAttestation["verdict"] | null;
  externalAuditorReady: boolean;
};

export function isIso42001CertBodyEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_ISO_42001_CERT_BODY === "1";
}

export function certBodyAttestationTtlDays(): number {
  return Number(process.env.THEME_EXPERIMENT_ISO_42001_ATTESTATION_TTL_DAYS ?? "365");
}

export function readIso42001CertBodyPack(raw: unknown): Iso42001CertBodyPack | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).iso42001CertBodyPack;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  return o as Iso42001CertBodyPack;
}

export function mergeIso42001CertBodyPack(
  previousRaw: unknown,
  pack: Iso42001CertBodyPack,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.iso42001CertBodyPack = pack;
  return base;
}

export function recordCertBodyAttestation(
  previousRaw: unknown,
  attestation: Omit<CertBodyAttestation, "at" | "attestationId"> & { attestationId?: string },
): { json: Record<string, unknown>; pack: Iso42001CertBodyPack } {
  const prev = readIso42001CertBodyPack(previousRaw);
  const entry: CertBodyAttestation = {
    at: new Date().toISOString(),
    attestationId: attestation.attestationId ?? `cb-${Date.now()}`,
    certBodyId: attestation.certBodyId,
    certBodyName: attestation.certBodyName,
    scope: attestation.scope,
    stage: attestation.stage,
    verdict: attestation.verdict,
    validUntil: attestation.validUntil,
    auditorPortalUrl:
      attestation.auditorPortalUrl ??
      process.env.ISO_42001_AUDITOR_PORTAL_URL ??
      null,
  };

  const attestations = [...(prev?.attestations ?? []), entry].slice(-20);
  const latest = attestations[attestations.length - 1] ?? null;
  const externalAuditorReady =
    latest !== null &&
    (latest.verdict === "conformant" || latest.verdict === "minor_nc") &&
    new Date(latest.validUntil).getTime() > Date.now();

  const pack: Iso42001CertBodyPack = {
    at: new Date().toISOString(),
    attestations,
    latestVerdict: latest?.verdict ?? null,
    externalAuditorReady,
  };

  return { json: mergeIso42001CertBodyPack(previousRaw, pack), pack };
}

export function seedCertBodyAttestationFromStage2(raw: unknown): Iso42001CertBodyPack {
  const stage2 = readIso42001Stage2Pack(raw);
  const ms = readIso42001AiMsPack(raw);
  const ttlDays = certBodyAttestationTtlDays();
  const validUntil = new Date(Date.now() + ttlDays * 86400 * 1000).toISOString();

  const verdict: CertBodyAttestation["verdict"] =
    stage2?.stage2Ready && ms ? "conformant" : stage2 ? "minor_nc" : "major_nc";

  return {
    at: new Date().toISOString(),
    attestations: [
      {
        at: new Date().toISOString(),
        attestationId: `cb-seed-${Date.now()}`,
        certBodyId: process.env.ISO_42001_CERT_BODY_ID ?? "cert-body-sim",
        certBodyName: process.env.ISO_42001_CERT_BODY_NAME ?? "Accredited CB (sim)",
        scope: "ISO/IEC 42001:2023",
        stage: "surveillance",
        verdict,
        validUntil,
        auditorPortalUrl: process.env.ISO_42001_AUDITOR_PORTAL_URL ?? null,
      },
    ],
    latestVerdict: verdict,
    externalAuditorReady: verdict !== "major_nc",
  };
}

export function evaluateIso42001CertBodyPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isIso42001CertBodyEnabled()) {
    return { passed: true, headline: "ISO 42001 cert body off", detail: "" };
  }
  if (!isIso42001Stage2Enabled()) {
    return {
      passed: false,
      headline: "ISO 42001 Stage 2 required",
      detail: "Enable THEME_EXPERIMENT_ISO_42001_STAGE2=1 (X4).",
    };
  }
  if (!isIso42001AiMsEnabled()) {
    return {
      passed: false,
      headline: "ISO 42001 AI MS required",
      detail: "Enable THEME_EXPERIMENT_ISO_42001=1 (W4).",
    };
  }
  const stage2 = readIso42001Stage2Pack(raw);
  if (!stage2?.stage2Ready) {
    return {
      passed: false,
      headline: "Stage 2 not ready for cert body",
      detail: "Complete surveillance audit before external attestation.",
    };
  }
  const pack = readIso42001CertBodyPack(raw);
  if (!pack || pack.attestations.length === 0) {
    return {
      passed: false,
      headline: "Cert body attestation missing",
      detail: "Webhook or cert-body-seed cron required.",
    };
  }
  if (!pack.externalAuditorReady) {
    return {
      passed: false,
      headline: `Cert body verdict: ${pack.latestVerdict ?? "unknown"}`,
      detail: "External auditor portal not ready for publish.",
    };
  }
  const latest = pack.attestations[pack.attestations.length - 1]!;
  if (latest.verdict === "major_nc") {
    return {
      passed: false,
      headline: "Major non-conformity from cert body",
      detail: "Resolve NC before certified-region publish.",
    };
  }
  return {
    passed: true,
    headline: `Cert body OK (${latest.certBodyName})`,
    detail: `${latest.stage} · valid until ${latest.validUntil.slice(0, 10)}`,
  };
}
