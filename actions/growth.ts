"use server";


import { fail, ok } from "@/lib/action-result";
import {
  AppFeedbackStatus,
  BetaLeadStatus,
  BusinessType,
  DemoRequestStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { assertGrowthAccess } from "@/lib/growth/growth-permissions";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import type { OutreachTemplate } from "@/lib/growth/outreach-generate";

async function assertOwner() {
  return assertGrowthAccess();
}

export async function updateBetaLeadStatus(input: {
  leadId: string;
  status: BetaLeadStatus;
}) {
  try {
    await assertOwner();
    await prisma.betaLead.update({
      where: { id: input.leadId },
      data: { status: input.status },
    });
    revalidatePath("/dashboard/growth/leads");
    revalidatePath(`/dashboard/growth/leads/${input.leadId}`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateBetaLeadPriority(input: {
  leadId: string;
  priority: number;
}) {
  try {
    await assertOwner();
    const priority = Math.min(9, Math.max(0, Math.floor(Number(input.priority)) || 0));
    await prisma.betaLead.update({
      where: { id: input.leadId },
      data: { priority },
    });
    revalidatePath("/dashboard/growth/leads");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function appendBetaLeadNote(input: {
  leadId: string;
  body: string;
}) {
  try {
    await assertOwner();
    const body = input.body.trim();
    if (!body) return { error: "Note cannot be empty." };
    await prisma.betaLeadNote.create({
      data: { betaLeadId: input.leadId, body },
    });
    revalidatePath("/dashboard/growth/leads");
    revalidatePath(`/dashboard/growth/leads/${input.leadId}`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function convertBetaLeadToDemoRequest(leadId: string) {
  try {
    await assertOwner();
    const lead = await prisma.betaLead.findUnique({ where: { id: leadId } });
    if (!lead) return { error: "Lead not found." };
    await prisma.demoRequest.create({
      data: {
        betaLeadId: lead.id,
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        businessName: lead.businessName,
        website: lead.businessWebsite,
        businessType: lead.businessType,
        currentPlatform: JSON.stringify(lead.currentChannels),
        weeklyOrderVolume: lead.weeklyOrderVolume,
        painPoints: lead.biggestPain,
        notes: `Converted from beta lead ${lead.id}`,
      },
    });
    await prisma.betaLead.update({
      where: { id: leadId },
      data: { status: BetaLeadStatus.DEMO_BOOKED },
    });
    revalidatePath("/dashboard/growth/leads");
    revalidatePath("/dashboard/growth/demo-requests");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateDemoRequestStatus(input: {
  id: string;
  status: DemoRequestStatus;
}) {
  try {
    await assertOwner();
    await prisma.demoRequest.update({
      where: { id: input.id },
      data: { status: input.status },
    });
    revalidatePath("/dashboard/growth/demo-requests");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateAppFeedbackStatus(input: {
  id: string;
  status: AppFeedbackStatus;
}) {
  try {
    await assertOwner();
    await prisma.appFeedback.update({
      where: { id: input.id },
      data: { status: input.status },
    });
    revalidatePath("/dashboard/growth/feedback");
    revalidatePath("/dashboard/growth/roadmap");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

function uuidOrNull(raw: unknown): string | null {
  const s = String(raw ?? "").trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s,
  )
    ? s
    : null;
}

export async function createOnboardingCall(formData: FormData) {
  try {
    await assertOwner();
    const businessName = String(formData.get("businessName") ?? "").trim();
    const contactName = String(formData.get("contactName") ?? "").trim();
    const callDate = String(formData.get("callDate") ?? "").trim();
    if (!businessName || !contactName || !callDate) {
      return { error: "Business name, contact, and call date are required." };
    }
    await prisma.onboardingCall.create({
      data: {
        businessName,
        contactName,
        callDate: new Date(callDate),
        userId: uuidOrNull(formData.get("userId")),
        betaLeadId: uuidOrNull(formData.get("betaLeadId")),
        demoRequestId: uuidOrNull(formData.get("demoRequestId")),
        stage: String(formData.get("stage") ?? "").trim() || null,
        goals: String(formData.get("goals") ?? "").trim() || null,
        currentWorkflow:
          String(formData.get("currentWorkflow") ?? "").trim() || null,
        painPoints: String(formData.get("painPoints") ?? "").trim() || null,
        integrationsNeeded:
          String(formData.get("integrationsNeeded") ?? "").trim() || null,
        objections: String(formData.get("objections") ?? "").trim() || null,
        nextSteps: String(formData.get("nextSteps") ?? "").trim() || null,
        successCriteria:
          String(formData.get("successCriteria") ?? "").trim() || null,
        outcome: String(formData.get("outcome") ?? "").trim() || null,
        notes: String(formData.get("notes") ?? "").trim() || null,
      },
    });
    revalidatePath("/dashboard/growth/onboarding-calls");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function dismissActivationChecklist() {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const workspaceId = await ensureOwnerWorkspaceId(dataUserId);
    await prisma.activationState.upsert({
      where: { userId: dataUserId },
      create: { userId: dataUserId, workspaceId, checklistDismissed: true },
      update: { workspaceId, checklistDismissed: true },
    });
    revalidatePath("/dashboard");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function ensureReferralCode() {
  try {
    const user = await assertOwner();
    const existing = await prisma.referralCode.findFirst({
      where: { userId: user.id, active: true },
    });
    if (existing) return { ok: true as const, code: existing.code };

    const base = `KOS-${user.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
    let code = base;
    let n = 0;
    while (n < 20) {
      const taken = await prisma.referralCode.findUnique({
        where: { code },
      });
      if (!taken) break;
      code = `${base}-${n + 1}`;
      n++;
    }
    await prisma.referralCode.create({
      data: { userId: user.id, code },
    });
    revalidatePath("/dashboard/growth/referrals");
    return { ok: true as const, code };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createDraftReleaseNote(formData: FormData) {
  try {
    await assertOwner();
    const title = String(formData.get("title") ?? "").trim();
    const slug = String(formData.get("slug") ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "");
    const version = String(formData.get("version") ?? "").trim();
    const summary = String(formData.get("summary") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    if (!title || !slug || !version || !summary || !content) {
      return { error: "All fields are required." };
    }
    await prisma.releaseNote.create({
      data: {
        title,
        slug,
        version,
        summary,
        content,
        published: false,
      },
    });
    revalidatePath("/dashboard/developer/releases");
    revalidatePath("/changelog");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function publishReleaseNote(id: string) {
  try {
    await assertOwner();
    await prisma.releaseNote.update({
      where: { id },
      data: { published: true, publishedAt: new Date() },
    });
    revalidatePath("/dashboard/developer/releases");
    revalidatePath("/changelog");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function generateOutreachMessage(formData: FormData) {
  try {
    await assertOwner();
    const leadId = String(formData.get("leadId") ?? "").trim();
    const template = String(formData.get("template") ?? "cold_email").trim();
    const allowed: OutreachTemplate[] = [
      "cold_email",
      "linkedin_dm",
      "follow_up_1",
      "follow_up_2",
      "demo_recap",
      "beta_invite",
      "integration_soon",
    ];
    const t = allowed.includes(template as OutreachTemplate)
      ? (template as OutreachTemplate)
      : "cold_email";
    const lead = await prisma.betaLead.findUnique({ where: { id: leadId } });
    if (!lead) return { error: "Lead not found." };
    const { generateOutreachDraft } = await import(
      "@/lib/growth/outreach-generate"
    );
    const text = await generateOutreachDraft({ lead, template: t });
    return { ok: true as const, text };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function sendTestLeadEmail(leadId: string) {
  try {
    await assertOwner();
    const lead = await prisma.betaLead.findUnique({ where: { id: leadId } });
    if (!lead) return { error: "Lead not found." };
    const { notifyGrowthInbound } = await import("@/lib/growth/growth-notify");
    await notifyGrowthInbound(
      `Manual send: ${lead.businessName}`,
      `Follow-up draft for ${lead.fullName} <${lead.email}>\nStatus: ${lead.status}\nScore: ${lead.score}`,
    );
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

/** Form-friendly wrappers (React `action` expects `Promise<void>`). */
export async function submitDraftReleaseNoteForm(
  formData: FormData,
): Promise<void> {
  await createDraftReleaseNote(formData);
}

export async function submitOnboardingCallForm(
  formData: FormData,
): Promise<void> {
  await createOnboardingCall(formData);
}

export async function dismissActivationChecklistForm(
  _formData: FormData,
): Promise<void> {
  await dismissActivationChecklist();
}

export async function publishReleaseNoteFromForm(
  formData: FormData,
): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await publishReleaseNote(id);
}
