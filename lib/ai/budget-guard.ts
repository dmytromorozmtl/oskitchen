import { prisma } from "@/lib/prisma";

export class AIBudgetExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIBudgetExceededError";
  }
}

const METRIC_KEY = "ai_tokens";
const PLAN_TOKEN_LIMITS: Record<string, number> = {
  STARTER: 50_000,
  PRO: 200_000,
  BUSINESS: 1_000_000,
  TEAM: 1_000_000,
};

/** Rough token estimate from text length (conservative). */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3);
}

function monthBounds(): { start: Date; end: Date } {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { start, end };
}

async function resolveOwnerUserId(workspaceId: string): Promise<string> {
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerUserId: true },
  });
  if (!ws) throw new Error("Workspace not found");
  return ws.ownerUserId;
}

async function getMonthlyUsage(ownerUserId: string): Promise<number> {
  const { start, end } = monthBounds();
  const row = await prisma.usageCounter.findUnique({
    where: {
      userId_metricKey_periodStart: {
        userId: ownerUserId,
        metricKey: METRIC_KEY,
        periodStart: start,
      },
    },
    select: { used: true },
  });
  if (row) return row.used;

  const agg = await prisma.usageCounter.aggregate({
    where: {
      userId: ownerUserId,
      metricKey: METRIC_KEY,
      periodStart: { gte: start },
      periodEnd: { lte: end },
    },
    _sum: { used: true },
  });
  return agg._sum.used ?? 0;
}

async function getLimit(workspaceId: string): Promise<number> {
  const sub = await prisma.subscription.findFirst({
    where: { workspaceId },
    select: { plan: true },
    orderBy: { updatedAt: "desc" },
  });
  const plan = sub?.plan ?? "STARTER";
  return PLAN_TOKEN_LIMITS[plan] ?? PLAN_TOKEN_LIMITS.STARTER;
}

/**
 * Enforce per-workspace monthly AI token budget before OCR / copilot calls.
 */
export async function checkAIBudget(
  workspaceId: string,
  estimatedTokens: number,
): Promise<void> {
  const ownerUserId = await resolveOwnerUserId(workspaceId);
  const [usage, limit] = await Promise.all([
    getMonthlyUsage(ownerUserId),
    getLimit(workspaceId),
  ]);

  if (usage + estimatedTokens > limit) {
    const reset = new Date();
    reset.setUTCMonth(reset.getUTCMonth() + 1, 1);
    reset.setUTCHours(0, 0, 0, 0);
    throw new AIBudgetExceededError(
      `Monthly AI limit reached (${usage}/${limit} tokens). Resets ${reset.toISOString().slice(0, 10)} or upgrade plan.`,
    );
  }
}

export async function recordAIUsage(
  workspaceId: string,
  tokensUsed: number,
  _feature: string,
): Promise<void> {
  const ownerUserId = await resolveOwnerUserId(workspaceId);
  const { start, end } = monthBounds();

  await prisma.usageCounter.upsert({
    where: {
      userId_metricKey_periodStart: {
        userId: ownerUserId,
        metricKey: METRIC_KEY,
        periodStart: start,
      },
    },
    create: {
      userId: ownerUserId,
      metricKey: METRIC_KEY,
      periodStart: start,
      periodEnd: end,
      used: tokensUsed,
      hardLimit: await getLimit(workspaceId),
    },
    update: { used: { increment: tokensUsed } },
  });
}
