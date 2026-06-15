import { redirect } from "next/navigation";

import { ensureTrialStateForUser } from "@/lib/billing/access";
import { prisma } from "@/lib/prisma";
import { recordLifecycleEventSafe } from "@/lib/lifecycle-events";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import { createClient } from "@/lib/supabase/server";

/** Supabase auth user (JWT-backed). */
export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** @alias getSessionUser */
export const getCurrentUser = getSessionUser;

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/** @alias requireSessionUser */
export const requireUser = requireSessionUser;

export async function getCurrentUserProfile() {
  const session = await getSessionUser();
  if (!session?.id) return null;
  return prisma.userProfile.findUnique({ where: { id: session.id } });
}

export async function requireUserProfile() {
  const session = await requireSessionUser();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
  });
  if (profile?.deletedAt) {
    redirect("/login?error=account_deactivated");
  }
  if (!profile) {
    await ensureAppUser(session.id, session.email ?? "");
    return prisma.userProfile.findUniqueOrThrow({ where: { id: session.id } });
  }
  return profile;
}

export async function ensureAppUser(userId: string, email: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return null;

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Chef";
  const companyName = user.user_metadata?.company_name as string | undefined;

  await prisma.userProfile.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email,
      fullName,
      companyName: companyName ?? null,
      onboardingCompleted: false,
      onboardingStep: 0,
    },
    update: {
      email,
      fullName,
      companyName: companyName ?? undefined,
    },
  });

  const workspaceId = await ensureOwnerWorkspaceId(userId);

  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId },
  });
  if (!existingSubscription) {
    await prisma.subscription.create({
      data: {
        userId,
        workspaceId,
        plan: "STARTER",
        status: "TRIALING",
      },
    });
    await ensureTrialStateForUser(userId, "STARTER").catch(() => undefined);
    await recordLifecycleEventSafe(userId, "signed_up", {
      source: "ensure_app_user",
    });
  } else {
    await ensureTrialStateForUser(userId, existingSubscription.plan).catch(
      () => undefined,
    );
  }

  const existingSettings = await prisma.kitchenSettings.findUnique({
    where: { userId },
  });
  if (!existingSettings) {
    await prisma.kitchenSettings.create({
      data: {
        userId,
        workspaceId,
        businessName: companyName ?? null,
      },
    });
  }

  await prisma.activationState
    .upsert({
      where: { userId },
      create: { userId, workspaceId },
      update: { workspaceId },
    })
    .catch(() => undefined);

  const { ensurePlatformOwnerBootstrap } = await import("@/lib/platform-admin");
  await ensurePlatformOwnerBootstrap(userId, email).catch(() => undefined);

  const { acceptPendingStorefrontInvitesForUser } = await import(
    "@/services/storefront/storefront-team-invite-accept-service"
  );
  await acceptPendingStorefrontInvitesForUser(userId, email).catch(() => undefined);

  return prisma.userProfile.findUnique({ where: { id: userId } });
}
