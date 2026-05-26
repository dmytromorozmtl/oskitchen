import type { PlatformRole } from "@prisma/client";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import {
  getProductionCronOpsMetadata,
  type CronEscalationOwnerTeam,
} from "@/services/cron/cron-ops-catalog";
import type { ProductionCronSlug } from "@/services/cron/production-manifest";

type EscalationOverrideKey = CronEscalationOwnerTeam | "default";

type EscalationOwnerOverrideMap = Partial<Record<EscalationOverrideKey, string>>;

type PlatformRoleCandidate = {
  userId: string;
  role: PlatformRole;
  createdAt: Date;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
};

export type CronEscalationAssignee = {
  userId: string;
  fullName: string;
  email: string;
};

export type CronEscalationAssignmentResolution =
  | "team_email_override"
  | "default_email_override"
  | "role_fallback"
  | "unassigned";

export type CronEscalationAssignment = {
  resolution: CronEscalationAssignmentResolution;
  ownerTeam: CronEscalationOwnerTeam;
  assignee: CronEscalationAssignee | null;
  matchedRole: PlatformRole | null;
  attemptedOverrideEmail: string | null;
};

const VALID_OWNER_TEAMS = new Set<EscalationOverrideKey>([
  "channels",
  "storefront",
  "notifications",
  "system_health",
  "meal_plans",
  "menus",
  "orders",
  "default",
]);

function normalizeEmail(value: string | null | undefined): string | null {
  const email = value?.trim().toLowerCase() ?? "";
  if (!email) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function parseEscalationOwnerOverrides(): EscalationOwnerOverrideMap {
  const raw = process.env.CRON_ESCALATION_OWNER_EMAILS_JSON?.trim();
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      logger.warn("cron_escalation_owner_overrides_invalid_shape");
      return {};
    }

    const overrides: EscalationOwnerOverrideMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!VALID_OWNER_TEAMS.has(key as EscalationOverrideKey)) continue;
      if (typeof value !== "string") continue;
      const email = normalizeEmail(value);
      if (email) {
        overrides[key as EscalationOverrideKey] = email;
      }
    }
    return overrides;
  } catch (error) {
    logger.warn("cron_escalation_owner_overrides_parse_failed", {
      message: error instanceof Error ? error.message : "unknown_error",
    });
    return {};
  }
}

function sortCandidates(
  rows: PlatformRoleCandidate[],
  rolePriority: readonly PlatformRole[],
): PlatformRoleCandidate[] {
  const deduped = new Map<string, PlatformRoleCandidate>();

  for (const row of rows) {
    const existing = deduped.get(row.userId);
    const currentPriority = rolePriority.indexOf(row.role);
    if (!existing) {
      deduped.set(row.userId, row);
      continue;
    }
    const existingPriority = rolePriority.indexOf(existing.role);
    if (
      currentPriority < existingPriority ||
      (currentPriority === existingPriority && row.createdAt.getTime() < existing.createdAt.getTime()) ||
      (currentPriority === existingPriority &&
        row.createdAt.getTime() === existing.createdAt.getTime() &&
        row.user.email.localeCompare(existing.user.email) < 0)
    ) {
      deduped.set(row.userId, row);
    }
  }

  return [...deduped.values()].sort((a, b) => {
    const roleDelta = rolePriority.indexOf(a.role) - rolePriority.indexOf(b.role);
    if (roleDelta !== 0) return roleDelta;
    const createdDelta = a.createdAt.getTime() - b.createdAt.getTime();
    if (createdDelta !== 0) return createdDelta;
    return a.user.email.localeCompare(b.user.email);
  });
}

async function loadCandidates(
  rolePriority: readonly PlatformRole[],
  email: string | null,
  excludeUserIds: readonly string[],
): Promise<PlatformRoleCandidate[]> {
  return prisma.platformUserRole.findMany({
    where: {
      role: { in: [...rolePriority] },
      ...(excludeUserIds.length > 0 ? { userId: { notIn: [...excludeUserIds] } } : {}),
      ...(email ? { user: { email } } : {}),
    },
    select: {
      userId: true,
      role: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });
}

function toAssignment(
  candidate: PlatformRoleCandidate | null,
  resolution: CronEscalationAssignmentResolution,
  ownerTeam: CronEscalationOwnerTeam,
  attemptedOverrideEmail: string | null,
): CronEscalationAssignment {
  return {
    resolution,
    ownerTeam,
    assignee: candidate
      ? {
          userId: candidate.user.id,
          fullName: candidate.user.fullName,
          email: candidate.user.email,
        }
      : null,
    matchedRole: candidate?.role ?? null,
    attemptedOverrideEmail,
  };
}

export async function resolveCronEscalationAssignment(
  slug: ProductionCronSlug,
  options?: { excludeUserIds?: readonly string[] },
): Promise<CronEscalationAssignment> {
  const meta = getProductionCronOpsMetadata(slug);
  const overrides = parseEscalationOwnerOverrides();
  const teamOverrideEmail = overrides[meta.ownerTeam] ?? null;
  const defaultOverrideEmail = overrides.default ?? null;
  const excludeUserIds = options?.excludeUserIds ?? [];

  if (teamOverrideEmail) {
    const candidates = sortCandidates(
      await loadCandidates(meta.ownerRolePriority, teamOverrideEmail, excludeUserIds),
      meta.ownerRolePriority,
    );
    if (candidates[0]) {
      return toAssignment(candidates[0], "team_email_override", meta.ownerTeam, teamOverrideEmail);
    }
    logger.warn("cron_escalation_owner_team_override_unmatched", {
      slug,
      ownerTeam: meta.ownerTeam,
      email: teamOverrideEmail,
    });
  }

  if (defaultOverrideEmail) {
    const candidates = sortCandidates(
      await loadCandidates(meta.ownerRolePriority, defaultOverrideEmail, excludeUserIds),
      meta.ownerRolePriority,
    );
    if (candidates[0]) {
      return toAssignment(candidates[0], "default_email_override", meta.ownerTeam, defaultOverrideEmail);
    }
    logger.warn("cron_escalation_owner_default_override_unmatched", {
      slug,
      ownerTeam: meta.ownerTeam,
      email: defaultOverrideEmail,
    });
  }

  const fallbackCandidates = sortCandidates(
    await loadCandidates(meta.ownerRolePriority, null, excludeUserIds),
    meta.ownerRolePriority,
  );
  if (fallbackCandidates[0]) {
    return toAssignment(
      fallbackCandidates[0],
      "role_fallback",
      meta.ownerTeam,
      teamOverrideEmail ?? defaultOverrideEmail,
    );
  }

  return toAssignment(null, "unassigned", meta.ownerTeam, teamOverrideEmail ?? defaultOverrideEmail);
}
