"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAuditLog } from "@/lib/audit-log";
import { getCapitalPartnerBySlug } from "@/lib/commercial/capital-partners";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";

const interestSchema = z.object({
  partnerSlug: z.string().max(80).optional(),
  useCase: z.enum(["working_capital", "equipment", "expansion", "attestation_waitlist", "other"]),
  message: z.string().max(2000).optional(),
});

export async function submitCapitalInterestAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("reports.read.financial");
    if (!access.ok) return { error: access.error };

    const actor = await requireTenantActor();
    const parsed = interestSchema.safeParse({
      partnerSlug: formData.get("partnerSlug") || undefined,
      useCase: formData.get("useCase"),
      message: formData.get("message") || undefined,
    });
    if (!parsed.success) return { error: "Invalid financing interest form." };

    const profile = await prisma.userProfile.findUnique({
      where: { id: actor.sessionUser.id },
      select: { email: true, fullName: true },
    });
    const kitchen = await prisma.kitchenSettings.findUnique({
      where: { userId: actor.dataUserId },
      select: { businessName: true },
    });

    const partner = parsed.data.partnerSlug
      ? getCapitalPartnerBySlug(parsed.data.partnerSlug)
      : null;

    const summary = [
      "[Capital resources hub — financing interest]",
      `Use case: ${parsed.data.useCase}`,
      partner ? `Partner context: ${partner.name}` : "Partner context: general hub",
      parsed.data.message?.trim() ? `\n${parsed.data.message.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await prisma.salesInquiry.create({
      data: {
        fullName: profile?.fullName || "Workspace owner",
        email: (profile?.email ?? "unknown@workspace.local").toLowerCase(),
        company: kitchen?.businessName || null,
        message: summary,
        currentSystems: "OS Kitchen dashboard — capital resources hub",
        integrationsNeeded: [],
      },
    });

    await recordAuditLog({
      userId: actor.sessionUser.id,
      workspaceId: actor.workspaceId ?? null,
      action: "capital.interest_submitted",
      entityType: "CapitalResourcesHub",
      metadata: {
        useCase: parsed.data.useCase,
        partnerSlug: parsed.data.partnerSlug ?? null,
      },
    });

    revalidatePath("/dashboard/analytics/capital");
    revalidatePath("/dashboard/growth/sales-inquiries");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function logCapitalPartnerViewAction(partnerSlug: string) {
  try {
    const access = await requireMutationPermission("reports.read.financial");
    if (!access.ok) return { error: access.error };

    const partner = getCapitalPartnerBySlug(partnerSlug);
    if (!partner) return { error: "Unknown partner resource." };

    const actor = await requireTenantActor();
    await recordAuditLog({
      userId: actor.sessionUser.id,
      workspaceId: actor.workspaceId ?? null,
      action: "capital.partner_viewed",
      entityType: "CapitalPartner",
      entityId: partner.slug,
      metadata: {
        partnerName: partner.name,
        category: partner.category,
        internal: partner.internal ?? false,
      },
    });

    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
