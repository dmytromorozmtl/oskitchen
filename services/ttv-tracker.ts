/**
 * Time-to-value (TTV) tracker — records pilot milestones and computes hours between them.
 * Persists via UsageEvent rows (`ttv_milestone:*`) for honest, queryable TTV evidence.
 */
import { prisma } from "@/lib/prisma";

export type TtvMilestone =
  | "workspace_created"
  | "launch_wizard_started"
  | "first_order_created"
  | "first_pos_transaction";

export type TrackTtvMilestoneInput = {
  userId: string;
  workspaceId?: string | null;
  milestone: TtvMilestone;
  occurredAt?: Date;
  metadata?: Record<string, string | number | boolean | null>;
};

function milestoneEventName(milestone: TtvMilestone): string {
  return `ttv_milestone:${milestone}`;
}

/** Record a TTV milestone for later calculateTtv() — does not fabricate pilot env attestations. */
export async function trackTtvMilestone(input: TrackTtvMilestoneInput): Promise<{ id: string }> {
  const occurredAt = input.occurredAt ?? new Date();
  const row = await prisma.usageEvent.create({
    data: {
      userId: input.userId,
      workspaceId: input.workspaceId ?? undefined,
      eventName: milestoneEventName(input.milestone),
      route: "/ttv-tracker",
      metadata: {
        milestone: input.milestone,
        occurredAt: occurredAt.toISOString(),
        ...input.metadata,
      },
    },
    select: { id: true },
  });
  return { id: row.id };
}

export type CalculateTtvInput = {
  userId: string;
  startMilestone: TtvMilestone;
  endMilestone: TtvMilestone;
};

export type CalculateTtvResult =
  | { ok: true; hours: number; startAt: Date; endAt: Date }
  | { ok: false; reason: "missing_start" | "missing_end" | "invalid_range" };

function resolveMilestoneTime(event: { createdAt: Date; metadata: unknown }): Date {
  if (event.metadata && typeof event.metadata === "object" && !Array.isArray(event.metadata)) {
    const occurredAt = (event.metadata as Record<string, unknown>).occurredAt;
    if (typeof occurredAt === "string") {
      const parsed = new Date(occurredAt);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }
  return event.createdAt;
}

/** Compute elapsed hours between two recorded milestones for a workspace owner. */
export async function calculateTtv(input: CalculateTtvInput): Promise<CalculateTtvResult> {
  const startName = milestoneEventName(input.startMilestone);
  const endName = milestoneEventName(input.endMilestone);

  const events = await prisma.usageEvent.findMany({
    where: {
      userId: input.userId,
      eventName: { in: [startName, endName] },
    },
    orderBy: { createdAt: "asc" },
    select: { eventName: true, createdAt: true, metadata: true },
  });

  const start = events.find((event) => event.eventName === startName);
  const end = [...events].reverse().find((event) => event.eventName === endName);

  if (!start) return { ok: false, reason: "missing_start" };
  if (!end) return { ok: false, reason: "missing_end" };

  const startAt = resolveMilestoneTime(start);
  const endAt = resolveMilestoneTime(end);
  if (endAt.getTime() < startAt.getTime()) {
    return { ok: false, reason: "invalid_range" };
  }

  const hours = (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60);
  return {
    ok: true,
    hours: Math.round(hours * 100) / 100,
    startAt,
    endAt,
  };
}
