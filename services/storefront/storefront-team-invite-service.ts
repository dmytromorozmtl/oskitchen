import { randomBytes } from "crypto";

import { toInputJsonValue } from "@/lib/prisma/json";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getPrimaryOwnerStorefront } from "@/lib/storefront/resolve-owner-storefront";
import { logStorefrontTeamInviteEvent } from "@/services/storefront/storefront-invite-audit";
import {
  mergePendingInvites,
  parseStorefrontPendingInvites,
} from "@/lib/storefront/storefront-team-invites";
import type { WorkspaceMemberRole } from "@prisma/client";

const INVITE_TTL_DAYS = 30;
const REMINDER_AFTER_DAYS = 7;

export type StorefrontTeamInviteRow = {
  id: string;
  email: string;
  role: WorkspaceMemberRole;
  token: string;
  invitedAt: Date;
  expiresAt: Date | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function newToken(): string {
  return randomBytes(32).toString("base64url");
}

function expiresAtFromNow(): Date {
  const d = new Date();
  d.setDate(d.getDate() + INVITE_TTL_DAYS);
  return d;
}

/** One-time migration from legacy JSON pendingInvites → DB rows. */
export async function migrateLegacyPendingInvitesForOwner(ownerUserId: string): Promise<number> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  const legacy = parseStorefrontPendingInvites(kitchen?.settingsCenterJson);
  if (legacy.length === 0) return 0;

  const sf = await getPrimaryOwnerStorefront(ownerUserId);
  if (!sf) return 0;
  const sfScoped = { id: sf.id, workspaceId: sf.workspaceId };
  if (!sfScoped.workspaceId) return 0;

  let migrated = 0;
  for (const inv of legacy) {
    const email = normalizeEmail(inv.email);
    const existing = await prisma.storefrontTeamInvite.findFirst({
      where: { workspaceId: sfScoped.workspaceId, email: { equals: email, mode: "insensitive" } },
    });
    if (existing) continue;

    await prisma.storefrontTeamInvite.create({
      data: {
        storefrontId: sfScoped.id,
        workspaceId: sfScoped.workspaceId,
        email,
        role: inv.role,
        token: newToken(),
        invitedByUserId: inv.invitedByUserId,
        invitedAt: new Date(inv.invitedAt),
        expiresAt: expiresAtFromNow(),
      },
    });
    migrated += 1;
  }

  if (migrated > 0) {
    const center = mergePendingInvites(kitchen?.settingsCenterJson, []);
    await prisma.kitchenSettings.update({
      where: { userId: ownerUserId },
      data: { settingsCenterJson: toInputJsonValue(center) },
    });
    logger.info("storefront_invites_migrated_from_json", { ownerUserId, migrated });
  }

  return migrated;
}

export async function listPendingStorefrontInvites(storefrontId: string): Promise<StorefrontTeamInviteRow[]> {
  const rows = await prisma.storefrontTeamInvite.findMany({
    where: { storefrontId, acceptedAt: null },
    orderBy: { invitedAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    role: r.role,
    token: r.token,
    invitedAt: r.invitedAt,
    expiresAt: r.expiresAt,
  }));
}

export async function createStorefrontTeamInvite(input: {
  storefrontId: string;
  workspaceId: string;
  email: string;
  role: WorkspaceMemberRole;
  invitedByUserId: string;
}): Promise<StorefrontTeamInviteRow> {
  const email = normalizeEmail(input.email);
  const existing = await prisma.storefrontTeamInvite.findFirst({
    where: {
      workspaceId: input.workspaceId,
      email: { equals: email, mode: "insensitive" },
      acceptedAt: null,
    },
  });
  if (existing) {
    return {
      id: existing.id,
      email: existing.email,
      role: existing.role,
      token: existing.token,
      invitedAt: existing.invitedAt,
      expiresAt: existing.expiresAt,
    };
  }

  const row = await prisma.storefrontTeamInvite.create({
    data: {
      storefrontId: input.storefrontId,
      workspaceId: input.workspaceId,
      email,
      role: input.role,
      token: newToken(),
      invitedByUserId: input.invitedByUserId,
      expiresAt: expiresAtFromNow(),
    },
  });

  await logStorefrontTeamInviteEvent({
    eventType: "created",
    storefrontId: input.storefrontId,
    workspaceId: input.workspaceId,
    inviteId: row.id,
    actorUserId: input.invitedByUserId,
    targetEmail: email,
    metadata: { role: input.role },
  });

  return {
    id: row.id,
    email: row.email,
    role: row.role,
    token: row.token,
    invitedAt: row.invitedAt,
    expiresAt: row.expiresAt,
  };
}

export async function cancelStorefrontTeamInvite(inviteId: string, storefrontId: string): Promise<boolean> {
  const row = await prisma.storefrontTeamInvite.findFirst({
    where: { id: inviteId, storefrontId, acceptedAt: null },
    select: { id: true, workspaceId: true, email: true },
  });
  if (!row) return false;

  await logStorefrontTeamInviteEvent({
    eventType: "cancelled",
    storefrontId,
    workspaceId: row.workspaceId,
    inviteId: row.id,
    targetEmail: row.email,
  });

  const res = await prisma.storefrontTeamInvite.deleteMany({
    where: { id: inviteId, storefrontId, acceptedAt: null },
  });
  return res.count > 0;
}

export async function findInviteByToken(token: string) {
  return prisma.storefrontTeamInvite.findUnique({
    where: { token: token.trim() },
    include: {
      storefront: { select: { publicName: true, storeSlug: true } },
      workspace: { select: { name: true } },
    },
  });
}

export async function acceptStorefrontTeamInvite(input: {
  token: string;
  userId: string;
  email: string;
}): Promise<{ ok: true; workspaceId: string } | { ok: false; error: string }> {
  const invite = await findInviteByToken(input.token);
  if (!invite) return { ok: false, error: "This invitation is invalid or has already been used." };
  if (invite.acceptedAt) return { ok: false, error: "This invitation was already accepted." };
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return { ok: false, error: "This invitation has expired. Ask the owner to send a new one." };
  }

  const email = normalizeEmail(input.email);
  if (email !== normalizeEmail(invite.email)) {
    return {
      ok: false,
      error: "Sign in with the email address that received this invitation.",
    };
  }

  const existing = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: invite.workspaceId, userId: input.userId },
    },
  });
  if (!existing) {
    await prisma.workspaceMember.create({
      data: {
        workspaceId: invite.workspaceId,
        userId: input.userId,
        role: invite.role,
      },
    });
  }

  await prisma.storefrontTeamInvite.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date(), acceptedUserId: input.userId },
  });

  await logStorefrontTeamInviteEvent({
    eventType: "accepted",
    storefrontId: invite.storefrontId,
    workspaceId: invite.workspaceId,
    inviteId: invite.id,
    actorUserId: input.userId,
    targetEmail: email,
  });

  logger.info("storefront_invite_accepted_by_token", {
    inviteId: invite.id,
    workspaceId: invite.workspaceId,
    userId: input.userId,
  });

  return { ok: true, workspaceId: invite.workspaceId };
}

/** Accept all pending invites for email (login/signup hook). */
export async function acceptAllPendingInvitesForEmail(
  userId: string,
  email: string,
): Promise<{ accepted: number; workspaces: string[] }> {
  const normalized = normalizeEmail(email);
  const pending = await prisma.storefrontTeamInvite.findMany({
    where: {
      email: { equals: normalized, mode: "insensitive" },
      acceptedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });

  const workspaces: string[] = [];
  let accepted = 0;

  for (const invite of pending) {
    const res = await acceptStorefrontTeamInvite({
      token: invite.token,
      userId,
      email: normalized,
    });
    if (res.ok) {
      accepted += 1;
      workspaces.push(res.workspaceId);
    }
  }

  return { accepted, workspaces: [...new Set(workspaces)] };
}

/** Cron: remind invites pending ≥7 days (max once per 7 days per row). */
export async function remindStaleStorefrontInvites(): Promise<{ reminded: number; scanned: number }> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - REMINDER_AFTER_DAYS);

  const rows = await prisma.storefrontTeamInvite.findMany({
    where: {
      acceptedAt: null,
      invitedAt: { lte: cutoff },
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: {
      storefront: { select: { publicName: true } },
    },
    take: 100,
  });

  const { sendStorefrontTeamInviteEmail } = await import("@/lib/email");
  let reminded = 0;

  for (const row of rows) {
    const last = row.lastReminderAt;
    if (last && last > cutoff) continue;

    await sendStorefrontTeamInviteEmail({
      to: row.email,
      businessName: row.storefront.publicName,
      role: row.role,
      inviteToken: row.token,
      isReminder: true,
    }).catch(() => undefined);

    await prisma.storefrontTeamInvite.update({
      where: { id: row.id },
      data: { lastReminderAt: new Date() },
    });
    await logStorefrontTeamInviteEvent({
      eventType: "reminded",
      storefrontId: row.storefrontId,
      workspaceId: row.workspaceId,
      inviteId: row.id,
      targetEmail: row.email,
    });
    reminded += 1;
  }

  return { reminded, scanned: rows.length };
}
