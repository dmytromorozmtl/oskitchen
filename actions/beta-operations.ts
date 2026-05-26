"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import type { BetaProgramStage } from "@prisma/client";

import { assertBetaProgramAccess } from "@/lib/beta/beta-permissions";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { defaultTimestampsForStage, isAllowedProgramTransition } from "@/services/beta/beta-qualification-service";
import { refreshBetaLeadScores } from "@/services/beta/beta-scoring-service";
import {
  betaApprovalEmailText,
  betaWaitlistEmailText,
  createInvitationRecord,
  sendBetaApplicantEmail,
} from "@/services/beta/beta-email-service";

export async function updateBetaLeadProgramStage(leadId: string, stage: BetaProgramStage) {
  try {
    await assertBetaProgramAccess();
    const cur = await prisma.betaLead.findUnique({
      where: { id: leadId },
      select: { programStage: true, email: true, fullName: true, businessName: true },
    });
    if (!cur) return { error: "Application not found." };
    if (!isAllowedProgramTransition(cur.programStage, stage)) {
      return { error: "That stage transition is restricted — pick an adjacent stage." };
    }
    const ts = defaultTimestampsForStage(stage);
    await prisma.betaLead.update({
      where: { id: leadId },
      data: {
        programStage: stage,
        lastActivityAt: new Date(),
        ...ts,
      },
    });
    void refreshBetaLeadScores(leadId).catch(() => {});
    revalidatePath("/dashboard/beta-applications");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateBetaLeadFounderFields(input: {
  leadId: string;
  founderNotes?: string;
  internalTagsJson?: string;
  pinned?: boolean;
  betaCohortId?: string | null;
}) {
  try {
    await assertBetaProgramAccess();
    let internalTags: unknown = undefined;
    if (input.internalTagsJson != null) {
      try {
        internalTags = JSON.parse(input.internalTagsJson) as unknown;
      } catch {
        return { error: "Internal tags must be valid JSON (array of strings)." };
      }
    }
    await prisma.betaLead.update({
      where: { id: input.leadId },
      data: {
        ...(input.founderNotes !== undefined ? { founderNotes: input.founderNotes } : {}),
        ...(internalTags !== undefined
          ? {
              internalTags:
                internalTags as import("@prisma/client").Prisma.InputJsonValue,
            }
          : {}),
        ...(input.pinned !== undefined ? { pinned: input.pinned } : {}),
        ...(input.betaCohortId !== undefined ? { betaCohortId: input.betaCohortId } : {}),
        lastActivityAt: new Date(),
      },
    });
    revalidatePath("/dashboard/beta-applications");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function sendBetaLifecycleEmail(input: {
  leadId: string;
  kind: "approved" | "waitlist";
}) {
  try {
    await assertBetaProgramAccess();
    const lead = await prisma.betaLead.findUnique({
      where: { id: input.leadId },
      include: { cohort: { select: { name: true } } },
    });
    if (!lead) return { error: "Application not found." };
    const pack =
      input.kind === "approved"
        ? betaApprovalEmailText({
            contactName: lead.fullName,
            businessName: lead.businessName,
            cohortName: lead.cohort?.name,
          })
        : betaWaitlistEmailText({
            contactName: lead.fullName,
            businessName: lead.businessName,
          });
    const res = await sendBetaApplicantEmail(lead.email, pack.subject, pack.text);
    if (input.kind === "approved") {
      await createInvitationRecord(lead.id, lead.betaCohortId);
    }
    revalidatePath("/dashboard/beta-applications");
    return res;
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function bulkUpdateBetaProgramStage(leadIds: string[], stage: BetaProgramStage) {
  try {
    await assertBetaProgramAccess();
    for (const id of leadIds) {
      const cur = await prisma.betaLead.findUnique({
        where: { id },
        select: { programStage: true },
      });
      if (!cur) continue;
      if (!isAllowedProgramTransition(cur.programStage, stage)) continue;
      const ts = defaultTimestampsForStage(stage);
      await prisma.betaLead.update({
        where: { id },
        data: { programStage: stage, lastActivityAt: new Date(), ...ts },
      });
      void refreshBetaLeadScores(id).catch(() => {});
    }
    revalidatePath("/dashboard/beta-applications");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
