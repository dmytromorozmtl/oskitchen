"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import type { PartnerOrgType } from "@prisma/client";

import { slugifyBrandSlug } from "@/lib/brands/brand-helpers";
import { requirePartnerProvisionActor } from "@/lib/partner/require-partner-provision-actor";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";

async function uniquePartnerSlug(base: string): Promise<string> {
  const root = base || "partner";
  for (let i = 0; i < 12; i++) {
    const suffix = i === 0 ? "" : `-${Math.random().toString(36).slice(2, 8)}`;
    const candidate = `${root}${suffix}`.slice(0, 120);
    const clash = await prisma.partnerAccount.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!clash) return candidate;
  }
  return `${root}-${Date.now()}`.slice(0, 120);
}

export async function createPartnerOrganization(input: {
  name: string;
  orgType?: PartnerOrgType;
}) {
  try {
    const access = await requirePartnerProvisionActor({
      operation: "partner.create_organization",
    });
    if (!access.ok) {
      return { error: access.error };
    }
    const { actor } = access;
    const session = actor.sessionUser;

    const name = input.name.trim();
    if (name.length < 2) return { error: "Name must be at least 2 characters." };
    if (name.length > 255) return { error: "Name is too long." };

    const memberEmail = (session.email ?? "").trim().toLowerCase();
    if (!memberEmail) return { error: "Your account needs an email before creating a partner organization." };

    const slug = await uniquePartnerSlug(slugifyBrandSlug(name));

    const account = await prisma.partnerAccount.create({
      data: {
        name,
        slug,
        ownerUserId: session.id,
        orgType: input.orgType ?? "AGENCY",
      },
    });

    await prisma.partnerMember.upsert({
      where: {
        partnerAccountId_email: {
          partnerAccountId: account.id,
          email: memberEmail,
        },
      },
      create: {
        partnerAccountId: account.id,
        email: memberEmail,
        userId: session.id,
        role: "PARTNER_OWNER",
        acceptedAt: new Date(),
      },
      update: {
        userId: session.id,
        role: "PARTNER_OWNER",
        acceptedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/partner");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
