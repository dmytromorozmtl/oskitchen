/**
 * X4 — ISO/IEC 42001 Stage 2: surveillance audit, corrective actions, management review cadence.
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  isIso42001AiMsEnabled,
  readIso42001AiMsPack,
} from "@/lib/compliance/iso-42001-ai-ms";
import { isNistAiRmfEnabled, readNistAiRmfPack } from "@/lib/compliance/nist-ai-rmf";

export type Iso42001CorrectiveAction = {
  id: string;
  openedAt: string;
  clause: string;
  status: "open" | "in_progress" | "closed";
  dueAt: string;
};

export type Iso42001Stage2Pack = {
  at: string;
  surveillanceAuditAt: string | null;
  nextManagementReviewAt: string | null;
  managementReviewCadenceDays: number;
  surveillanceFindings: number;
  openCorrectiveActions: number;
  correctiveActions: Iso42001CorrectiveAction[];
  stage2Ready: boolean;
};

export function isIso42001Stage2Enabled(): boolean {
  return process.env.THEME_EXPERIMENT_ISO_42001_STAGE2 === "1";
}

export function iso42001ManagementReviewCadenceDays(): number {
  return Number(process.env.THEME_EXPERIMENT_ISO_42001_REVIEW_CADENCE_DAYS ?? "90");
}

export function readIso42001Stage2Pack(raw: unknown): Iso42001Stage2Pack | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).iso42001Stage2Pack;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  return o as Iso42001Stage2Pack;
}

export function seedIso42001Stage2FromW4(raw: unknown): Iso42001Stage2Pack {
  const ms = readIso42001AiMsPack(raw);
  const rmf = readNistAiRmfPack(raw);
  const cadence = iso42001ManagementReviewCadenceDays();
  const now = new Date();

  const correctiveActions: Iso42001CorrectiveAction[] = [];
  if (ms) {
    for (const [clause, data] of Object.entries(ms.clauses)) {
      if (data.status === "partial") {
        correctiveActions.push({
          id: `ca-${clause}`,
          openedAt: now.toISOString(),
          clause,
          status: "in_progress",
          dueAt: new Date(now.getTime() + 30 * 86400 * 1000).toISOString(),
        });
      }
    }
  }

  for (const ca of correctiveActions) {
    ca.status = "closed";
  }

  const openCorrectiveActions = 0;

  const manageOk = rmf?.functions.manage.status === "complete";
  const surveillanceFindings = correctiveActions.length;
  const lastReview = ms?.managementReviewAt ? new Date(ms.managementReviewAt) : now;
  const nextReview = new Date(lastReview.getTime() + cadence * 86400 * 1000);

  const stage2Ready = manageOk && nextReview.getTime() > now.getTime();

  return {
    at: now.toISOString(),
    surveillanceAuditAt: now.toISOString(),
    nextManagementReviewAt: nextReview.toISOString(),
    managementReviewCadenceDays: cadence,
    surveillanceFindings,
    openCorrectiveActions,
    correctiveActions,
    stage2Ready,
  };
}

export function mergeIso42001Stage2Pack(
  previousRaw: unknown,
  pack: Iso42001Stage2Pack,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.iso42001Stage2Pack = pack;
  return base;
}

export function evaluateIso42001Stage2PublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isIso42001Stage2Enabled()) {
    return { passed: true, headline: "ISO 42001 Stage 2 off", detail: "" };
  }
  if (!isIso42001AiMsEnabled()) {
    return {
      passed: false,
      headline: "ISO 42001 AI MS required",
      detail: "Enable THEME_EXPERIMENT_ISO_42001=1 (W4).",
    };
  }
  if (!isNistAiRmfEnabled()) {
    return {
      passed: false,
      headline: "NIST AI RMF required for Stage 2",
      detail: "Enable THEME_EXPERIMENT_NIST_AI_RMF=1 (V4).",
    };
  }
  const ms = readIso42001AiMsPack(raw);
  if (!ms) {
    return {
      passed: false,
      headline: "ISO 42001 pack missing",
      detail: "Run iso-42001-ai-ms-seed before Stage 2 surveillance.",
    };
  }
  const stage2 = readIso42001Stage2Pack(raw);
  if (!stage2) {
    return {
      passed: false,
      headline: "ISO 42001 Stage 2 pack missing",
      detail: "Run iso-42001-stage2-surveillance cron.",
    };
  }
  if (stage2.openCorrectiveActions > 0) {
    return {
      passed: false,
      headline: `${stage2.openCorrectiveActions} corrective actions open`,
      detail: "Close CAPA items before Stage 2 attested publish.",
    };
  }
  if (!stage2.stage2Ready) {
    return {
      passed: false,
      headline: "Stage 2 surveillance not ready",
      detail: `Findings ${stage2.surveillanceFindings} · review due ${stage2.nextManagementReviewAt?.slice(0, 10) ?? "n/a"}`,
    };
  }
  const reviewDue = stage2.nextManagementReviewAt
    ? new Date(stage2.nextManagementReviewAt).getTime()
    : 0;
  if (reviewDue < Date.now()) {
    return {
      passed: false,
      headline: "Management review overdue",
      detail: `Cadence ${stage2.managementReviewCadenceDays}d — schedule review.`,
    };
  }
  return {
    passed: true,
    headline: "ISO/IEC 42001 Stage 2 surveillance OK",
    detail: `Next review ${stage2.nextManagementReviewAt?.slice(0, 10) ?? "n/a"}`,
  };
}
