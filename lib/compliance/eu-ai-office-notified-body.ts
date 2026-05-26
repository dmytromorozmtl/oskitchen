/**
 * Z4 — EU AI Office notified body: Article 43 conformity assessment API sync (Y4 cert body + S4 EU AI Act).
 */

import { isEuAiActPackEnabled, readEuAiActPack } from "@/lib/compliance/eu-ai-act";
import { toJsonValue } from "@/lib/prisma/json";
import {
  isIso42001CertBodyEnabled,
  readIso42001CertBodyPack,
} from "@/lib/compliance/iso-42001-cert-body";

export type EuAiOfficeAssessment = {
  at: string;
  assessmentId: string;
  notifiedBodyId: string;
  notifiedBodyName: string;
  article: "Article-43";
  conformityStatus: "conformity" | "refusal" | "conditional";
  highRiskAiSystem: boolean;
  certBodyCrossRef: string | null;
  validUntil: string;
  euDatabaseUrl: string | null;
};

export type EuAiOfficeNotifiedBodyPack = {
  at: string;
  assessments: EuAiOfficeAssessment[];
  latestStatus: EuAiOfficeAssessment["conformityStatus"] | null;
  notifiedBodyReady: boolean;
};

export function isEuAiOfficeNotifiedBodyEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_EU_AI_OFFICE_NOTIFIED_BODY === "1";
}

export function readEuAiOfficeNotifiedBodyPack(raw: unknown): EuAiOfficeNotifiedBodyPack | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).euAiOfficeNotifiedBodyPack;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  return o as EuAiOfficeNotifiedBodyPack;
}

export function mergeEuAiOfficeNotifiedBodyPack(
  previousRaw: unknown,
  pack: EuAiOfficeNotifiedBodyPack,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.euAiOfficeNotifiedBodyPack = pack;
  return base;
}

export function recordEuAiOfficeAssessment(
  previousRaw: unknown,
  assessment: Omit<EuAiOfficeAssessment, "at" | "assessmentId" | "article"> & { assessmentId?: string },
): { json: Record<string, unknown>; pack: EuAiOfficeNotifiedBodyPack } {
  const prev = readEuAiOfficeNotifiedBodyPack(previousRaw);
  const entry: EuAiOfficeAssessment = {
    at: new Date().toISOString(),
    assessmentId: assessment.assessmentId ?? `eu-nb-${Date.now()}`,
    notifiedBodyId: assessment.notifiedBodyId,
    notifiedBodyName: assessment.notifiedBodyName,
    article: "Article-43",
    conformityStatus: assessment.conformityStatus,
    highRiskAiSystem: assessment.highRiskAiSystem,
    certBodyCrossRef: assessment.certBodyCrossRef,
    validUntil: assessment.validUntil,
    euDatabaseUrl: assessment.euDatabaseUrl ?? process.env.EU_AI_OFFICE_DATABASE_URL ?? null,
  };

  const assessments = [...(prev?.assessments ?? []), entry].slice(-20);
  const latest = assessments[assessments.length - 1] ?? null;
  const notifiedBodyReady =
    latest !== null &&
    (latest.conformityStatus === "conformity" || latest.conformityStatus === "conditional") &&
    new Date(latest.validUntil).getTime() > Date.now();

  const pack: EuAiOfficeNotifiedBodyPack = {
    at: new Date().toISOString(),
    assessments,
    latestStatus: latest?.conformityStatus ?? null,
    notifiedBodyReady,
  };

  return { json: mergeEuAiOfficeNotifiedBodyPack(previousRaw, pack), pack };
}

export function seedEuAiOfficeFromCertBodyAndEuAct(raw: unknown): EuAiOfficeNotifiedBodyPack {
  const cert = readIso42001CertBodyPack(raw);
  const eu = readEuAiActPack(raw);
  const latestCert = cert?.attestations[cert.attestations.length - 1];
  const ttlDays = Number(process.env.THEME_EXPERIMENT_EU_AI_OFFICE_TTL_DAYS ?? "365");
  const validUntil = new Date(Date.now() + ttlDays * 86400 * 1000).toISOString();

  const conformityStatus: EuAiOfficeAssessment["conformityStatus"] =
    latestCert?.verdict === "conformant" && eu
      ? "conformity"
      : latestCert
        ? "conditional"
        : "refusal";

  return {
    at: new Date().toISOString(),
    assessments: [
      {
        at: new Date().toISOString(),
        assessmentId: `eu-nb-seed-${Date.now()}`,
        notifiedBodyId: process.env.EU_AI_OFFICE_NOTIFIED_BODY_ID ?? "nb-sim-eu",
        notifiedBodyName: process.env.EU_AI_OFFICE_NOTIFIED_BODY_NAME ?? "EU Notified Body (sim)",
        article: "Article-43",
        conformityStatus,
        highRiskAiSystem: eu?.modelCard.riskTier === "high",
        certBodyCrossRef: latestCert?.attestationId ?? null,
        validUntil,
        euDatabaseUrl: process.env.EU_AI_OFFICE_DATABASE_URL ?? null,
      },
    ],
    latestStatus: conformityStatus,
    notifiedBodyReady: conformityStatus !== "refusal",
  };
}

export function evaluateEuAiOfficeNotifiedBodyGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isEuAiOfficeNotifiedBodyEnabled()) {
    return { passed: true, headline: "EU AI Office notified body off", detail: "" };
  }
  if (!isIso42001CertBodyEnabled()) {
    return {
      passed: false,
      headline: "ISO 42001 cert body required",
      detail: "Enable THEME_EXPERIMENT_ISO_42001_CERT_BODY=1 (Y4).",
    };
  }
  if (!isEuAiActPackEnabled()) {
    return {
      passed: false,
      headline: "EU AI Act pack required",
      detail: "Enable THEME_EXPERIMENT_EU_AI_ACT=1 (S4).",
    };
  }
  const cert = readIso42001CertBodyPack(raw);
  if (!cert?.externalAuditorReady) {
    return {
      passed: false,
      headline: "Cert body not ready for EU notified body sync",
      detail: "Complete Y4 external attestation first.",
    };
  }
  const pack = readEuAiOfficeNotifiedBodyPack(raw);
  if (!pack || pack.assessments.length === 0) {
    return {
      passed: false,
      headline: "Article 43 assessment missing",
      detail: "Run eu-ai-office-conformity-sync cron or webhook.",
    };
  }
  if (!pack.notifiedBodyReady) {
    return {
      passed: false,
      headline: `Notified body status: ${pack.latestStatus ?? "unknown"}`,
      detail: "EU AI Office conformity assessment not ready.",
    };
  }
  if (pack.latestStatus === "refusal") {
    return {
      passed: false,
      headline: "EU notified body refused conformity",
      detail: "Resolve Article 43 findings before EU publish.",
    };
  }
  return {
    passed: true,
    headline: "EU AI Office Article 43 aligned",
    detail: `Status ${pack.latestStatus} · ${pack.assessments.length} assessments`,
  };
}
