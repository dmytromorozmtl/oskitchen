"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { asVoidFormAction } from "@/lib/actions/server-form-action";
import { getSessionUser } from "@/lib/auth";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { revalidateTenantActor } from "@/lib/scope/revalidate-tenant-actor";

import { sendStorefrontTeamInviteEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { requireStorefrontAdminPermission } from "@/lib/storefront/storefront-admin-access";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import { SITE_URL } from "@/lib/constants";
import { safeError } from "@/lib/security";
import {
  acceptStorefrontTeamInvite,
  cancelStorefrontTeamInvite,
  createStorefrontTeamInvite,
  migrateLegacyPendingInvitesForOwner,
} from "@/services/storefront/storefront-team-invite-service";

const inviteSchema = z.object({
  email: z.string().email().max(255),
  role: z.enum(["STAFF", "ADMIN"]).default("STAFF"),
});

export async function inviteStorefrontTeamMemberAction(formData: FormData) {
  try {
    const { sessionUser: user } = await requireTenantActor();
    const access = await requireStorefrontAdminPermission("storefront.team");
    const sf = await prisma.storefrontSettings.findUnique({
      where: { id: access.storefront.id },
    });
    if (!sf) return { error: "Save storefront overview first." };
    if (!sf.workspaceId) {
      return { error: "Link a workspace on storefront overview before inviting team members." };
    }

    await migrateLegacyPendingInvitesForOwner(user.id);

    const parsed = inviteSchema.safeParse({
      email: formData.get("email")?.toString().trim().toLowerCase(),
      role: formData.get("role")?.toString() || "STAFF",
    });
    if (!parsed.success) return { error: "Enter a valid email address." };

    const email = parsed.data.email;

    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: sf.workspaceId,
        userProfile: { email: { equals: email, mode: "insensitive" } },
      },
    });
    if (existingMember) return { error: "This person is already on your workspace." };

    const profile = await prisma.userProfile.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (profile) {
      await prisma.workspaceMember.create({
        data: {
          workspaceId: sf.workspaceId,
          userId: profile.id,
          role: parsed.data.role,
        },
      });
      revalidateTenantActor(profile.id);
      revalidateTenantActor(user.id);
      revalidateStorefrontDashboardAndPublic(sf.storeSlug, "settings", { storefrontId: sf.id });
      revalidatePath("/dashboard/storefront/team");
      return { ok: true as const, joined: true as const, email };
    }

    const invite = await createStorefrontTeamInvite({
      storefrontId: sf.id,
      workspaceId: sf.workspaceId,
      email,
      role: parsed.data.role,
      invitedByUserId: user.id,
    });

    const businessName = sf.publicName?.trim() || "your storefront";
    await sendStorefrontTeamInviteEmail({
      to: email,
      businessName,
      role: parsed.data.role,
      inviteToken: invite.token,
    }).catch(() => undefined);

    revalidateStorefrontDashboardAndPublic(sf.storeSlug, "settings", {
      storefrontId: sf.id,
      ownerUserId: user.id,
    });
    revalidatePath("/dashboard/storefront/team");
    const inviteUrl = `${SITE_URL}/invite/${encodeURIComponent(invite.token)}`;
    return {
      ok: true as const,
      joined: false as const,
      email,
      emailSent: true as const,
      inviteUrl,
    };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function cancelStorefrontTeamInviteAction(formData: FormData) {
  try {
    await requireTenantActor();
    const access = await requireStorefrontAdminPermission("storefront.team");
    const sf = await prisma.storefrontSettings.findUnique({
      where: { id: access.storefront.id },
    });
    if (!sf) return { error: "Save storefront overview first." };

    const inviteId = formData.get("inviteId")?.toString();
    if (!inviteId) return { error: "Missing invite." };

    await cancelStorefrontTeamInvite(inviteId, sf.id);
    revalidatePath("/dashboard/storefront/team");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function removeStorefrontTeamMemberAction(formData: FormData) {
  try {
    const { sessionUser: user } = await requireTenantActor();
    const access = await requireStorefrontAdminPermission("storefront.team");
    const sf = await prisma.storefrontSettings.findUnique({
      where: { id: access.storefront.id },
    });
    if (!sf?.workspaceId) return { error: "No workspace linked." };

    const memberId = formData.get("memberId")?.toString();
    if (!memberId) return { error: "Missing member." };

    const member = await prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId: sf.workspaceId },
    });
    if (!member) return { error: "Member not found." };
    if (member.userId === user.id) return { error: "You cannot remove yourself." };

    await prisma.workspaceMember.delete({ where: { id: memberId } });
    revalidateTenantActor(member.userId);
    revalidateTenantActor(user.id);
    revalidatePath("/dashboard/storefront/team");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export const cancelStorefrontTeamInviteFormAction = asVoidFormAction(cancelStorefrontTeamInviteAction);
export const removeStorefrontTeamMemberFormAction = asVoidFormAction(removeStorefrontTeamMemberAction);

/** Deep link accept — called from /invite/[token] when user is signed in. */
export async function acceptStorefrontInviteByTokenAction(token: string) {
  try {
    const user = await getSessionUser();
    if (!user?.email) return { error: "Sign in to accept this invitation." };

    const res = await acceptStorefrontTeamInvite({
      token,
      userId: user.id,
      email: user.email,
    });
    if (!res.ok) return { error: res.error };

    revalidatePath("/dashboard/storefront");
    return { ok: true as const, workspaceId: res.workspaceId };
  } catch (e) {
    return { error: safeError(e) };
  }
}
