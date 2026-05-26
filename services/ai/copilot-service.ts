import { Prisma } from "@prisma/client";
import type { CopilotRedactionLevel } from "@prisma/client";

import { buildChatMessages, buildNarrativePrompt, buildSystemPrompt } from "@/lib/ai/copilot-prompts";
import { runOutboundGuardrail, COPILOT_MAX_OUTPUT_TOKENS } from "@/lib/ai/copilot-guardrails";
import type {
  CopilotActionDraftSeed,
  CopilotActionType,
  CopilotNarrativeResult,
} from "@/lib/ai/copilot-types";
import { getServerEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { assertAiAllowed } from "@/lib/ai/assert-ai-allowed";
import { estimateTokens, recordAIUsage } from "@/lib/ai/budget-guard";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { buildDeterministicSnapshot } from "@/services/ai/deterministic-insights-service";

type Scope = { userId: string; email: string | null; workspaceId?: string | null };

const DEFAULT_MODEL = "gpt-4o-mini";

export type CopilotSettingsView = {
  aiNarrativeEnabled: boolean;
  deterministicOnly: boolean;
  redactionLevel: CopilotRedactionLevel;
  requireApprovalAll: boolean;
  maxContextRows: number;
  summaryRetentionDays: number;
  privacyDisclaimer: string | null;
  hasApiKey: boolean;
};

export async function getCopilotSettings(scope: Scope): Promise<CopilotSettingsView> {
  const row = await prisma.copilotSettings.findUnique({ where: { userId: scope.userId } });
  const { OPENAI_API_KEY } = getServerEnv();
  if (!row) {
    return {
      aiNarrativeEnabled: true,
      deterministicOnly: false,
      redactionLevel: "PII_REDACTED",
      requireApprovalAll: true,
      maxContextRows: 50,
      summaryRetentionDays: 30,
      privacyDisclaimer: null,
      hasApiKey: !!OPENAI_API_KEY?.trim(),
    };
  }
  return {
    aiNarrativeEnabled: row.aiNarrativeEnabled,
    deterministicOnly: row.deterministicOnly,
    redactionLevel: row.redactionLevel,
    requireApprovalAll: row.requireApprovalAll,
    maxContextRows: row.maxContextRows,
    summaryRetentionDays: row.summaryRetentionDays,
    privacyDisclaimer: row.privacyDisclaimer,
    hasApiKey: !!OPENAI_API_KEY?.trim(),
  };
}

export async function upsertCopilotSettings(
  scope: Scope,
  patch: Partial<Omit<CopilotSettingsView, "hasApiKey">>,
): Promise<void> {
  const workspaceId =
    scope.workspaceId?.trim() || (await resolveOwnerWorkspaceId(scope.userId).catch(() => null));
  await prisma.copilotSettings.upsert({
    where: { userId: scope.userId },
    create: {
      userId: scope.userId,
      workspaceId: workspaceId ?? undefined,
      aiNarrativeEnabled: patch.aiNarrativeEnabled ?? true,
      deterministicOnly: patch.deterministicOnly ?? false,
      redactionLevel: patch.redactionLevel ?? "PII_REDACTED",
      requireApprovalAll: patch.requireApprovalAll ?? true,
      maxContextRows: patch.maxContextRows ?? 50,
      summaryRetentionDays: patch.summaryRetentionDays ?? 30,
      privacyDisclaimer: patch.privacyDisclaimer ?? null,
    },
    update: {
      ...(patch.aiNarrativeEnabled !== undefined
        ? { aiNarrativeEnabled: patch.aiNarrativeEnabled }
        : {}),
      ...(patch.deterministicOnly !== undefined ? { deterministicOnly: patch.deterministicOnly } : {}),
      ...(patch.redactionLevel ? { redactionLevel: patch.redactionLevel } : {}),
      ...(patch.requireApprovalAll !== undefined ? { requireApprovalAll: patch.requireApprovalAll } : {}),
      ...(patch.maxContextRows !== undefined ? { maxContextRows: patch.maxContextRows } : {}),
      ...(patch.summaryRetentionDays !== undefined
        ? { summaryRetentionDays: patch.summaryRetentionDays }
        : {}),
      ...(patch.privacyDisclaimer !== undefined ? { privacyDisclaimer: patch.privacyDisclaimer } : {}),
    },
  });
  await recordCopilotAudit(scope, "settings_changed", patch as Record<string, unknown>);
}

async function scopeWorkspaceId(scope: Scope): Promise<string | null> {
  return scope.workspaceId?.trim() || (await resolveOwnerWorkspaceId(scope.userId).catch(() => null));
}

export async function recordCopilotAudit(
  scope: Scope,
  eventType: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    const workspaceId = await scopeWorkspaceId(scope);
    await prisma.copilotAuditEvent.create({
      data: {
        userId: scope.userId,
        workspaceId: workspaceId ?? undefined,
        eventType,
        performedBy: scope.email ?? "user",
        metadataJson: metadata as Prisma.InputJsonValue,
      },
    });
  } catch {
    /* never fail user flow on audit write */
  }
}

export async function persistDeterministicInsights(
  scope: Scope,
): Promise<{ snapshot: Awaited<ReturnType<typeof buildDeterministicSnapshot>>; rowsWritten: number }> {
  const snapshot = await buildDeterministicSnapshot(scope.userId);
  const workspaceId = await scopeWorkspaceId(scope);
  await prisma.copilotInsight.deleteMany({
    where: { userId: scope.userId, deterministic: true, resolvedAt: null },
  });
  if (snapshot.insights.length === 0) {
    return { snapshot, rowsWritten: 0 };
  }
  const rows = snapshot.insights.map((seed) => ({
    userId: scope.userId,
    workspaceId: workspaceId ?? undefined,
    type: seed.type,
    severity: seed.severity,
    title: seed.title,
    summary: seed.summary,
    sourceType: seed.sourceType ?? null,
    sourceId: seed.sourceId ?? null,
    recommendedAction: seed.recommendedAction ?? null,
    actionRoute: seed.actionRoute ?? null,
    deterministic: true,
    metadataJson: (seed.metadata ?? {}) as Prisma.InputJsonValue,
  }));
  const result = await prisma.copilotInsight.createMany({ data: rows });
  return { snapshot, rowsWritten: result.count };
}

export type NarrativeContext = {
  rangeLabel: string;
  bulletSummary: string;
  mode: Awaited<ReturnType<typeof loadProfile>>["mode"];
  role: Awaited<ReturnType<typeof loadProfile>>["role"];
};

async function loadProfile(userId: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { kitchenSettings: { select: { businessType: true } } },
  });
  return {
    mode: profile?.kitchenSettings?.businessType ?? null,
    role: null as string | null,
  };
}

export async function generateNarrative(
  scope: Scope,
  context: NarrativeContext,
): Promise<CopilotNarrativeResult> {
  const settings = await getCopilotSettings(scope);
  if (settings.deterministicOnly || !settings.aiNarrativeEnabled) {
    return { status: "DISABLED_BY_SETTINGS", text: null };
  }
  if (!settings.hasApiKey) {
    return { status: "MISSING_API_KEY", text: null };
  }
  const { OPENAI_API_KEY } = getServerEnv();
  const prompt = buildNarrativePrompt({
    operatorRole: context.role,
    mode: context.mode,
    rangeLabel: context.rangeLabel,
    bulletSummary: context.bulletSummary,
  });
  const guardrail = runOutboundGuardrail(prompt, settings.redactionLevel);
  if (!guardrail.ok) {
    await recordCopilotAudit(scope, "narrative_blocked", { reason: guardrail.reason });
    return { status: "REDACTION_BLOCKED", text: null };
  }
  const system = buildSystemPrompt(context.mode, context.role);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: guardrail.sanitised },
        ],
        temperature: 0.2,
        max_tokens: COPILOT_MAX_OUTPUT_TOKENS,
      }),
    });
    if (!res.ok) {
      await recordCopilotAudit(scope, "narrative_provider_error", { status: res.status });
      return { status: "PROVIDER_ERROR", text: null, modelUsed: DEFAULT_MODEL };
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content?.trim() ?? null;
    await recordCopilotAudit(scope, "narrative_generated", { model: DEFAULT_MODEL });
    return { status: "OK", text, modelUsed: DEFAULT_MODEL };
  } catch (e) {
    await recordCopilotAudit(scope, "narrative_provider_error", {
      error: e instanceof Error ? e.message : "unknown",
    });
    return { status: "PROVIDER_ERROR", text: null, modelUsed: DEFAULT_MODEL };
  }
}

export type ChatTurnInput = {
  conversationId: string | null;
  message: string;
};

export type ChatTurnResult = {
  conversationId: string;
  reply: string;
  narrativeStatus: CopilotNarrativeResult["status"];
  contextSummary: string;
};

export async function runChatTurn(scope: Scope, input: ChatTurnInput): Promise<ChatTurnResult> {
  const limit = await assertAiAllowed({
    userId: scope.userId,
    workspaceId: scope.workspaceId,
    kind: "ai_copilot",
    estimatedText: input.message,
  });
  if (!limit.ok) {
    return {
      conversationId: input.conversationId ?? "",
      reply: limit.error,
      narrativeStatus: "PROVIDER_ERROR",
      contextSummary: "",
    };
  }

  let conversationId = input.conversationId;
  if (!conversationId) {
    const conv = await prisma.copilotConversation.create({
      data: {
        userId: scope.userId,
        title: input.message.slice(0, 80),
      },
    });
    conversationId = conv.id;
  } else {
    await prisma.copilotConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  }

  const profile = await loadProfile(scope.userId);
  const settings = await getCopilotSettings(scope);
  const snapshot = await buildDeterministicSnapshot(scope.userId);
  const contextSummary = `Range: ${snapshot.rangeLabel}\n${snapshot.bulletSummary}`;

  await prisma.copilotMessage.create({
    data: {
      conversationId,
      role: "USER",
      content: input.message,
      redactionLevel: settings.redactionLevel,
      metadataJson: {} as Prisma.InputJsonValue,
    },
  });

  let narrativeStatus: CopilotNarrativeResult["status"] = "DISABLED_BY_SETTINGS";
  let reply = "";

  if (settings.deterministicOnly || !settings.aiNarrativeEnabled) {
    narrativeStatus = "DISABLED_BY_SETTINGS";
    reply = buildDeterministicChatReply(input.message, snapshot.bulletSummary);
  } else if (!settings.hasApiKey) {
    narrativeStatus = "MISSING_API_KEY";
    reply = buildDeterministicChatReply(input.message, snapshot.bulletSummary);
  } else {
    const { OPENAI_API_KEY } = getServerEnv();
    const history = await prisma.copilotMessage.findMany({
      where: { conversationId, role: { in: ["USER", "ASSISTANT"] } },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: { role: true, content: true },
    });
    const messages = buildChatMessages({
      operatorRole: profile.role,
      mode: profile.mode,
      contextSummary,
      userMessage: input.message,
      history: history.slice(0, -1).map((m) => ({
        role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      })),
    });
    const fullPrompt = messages.map((m) => `[${m.role}]\n${m.content}`).join("\n\n");
    const guardrail = runOutboundGuardrail(fullPrompt, settings.redactionLevel);
    if (!guardrail.ok) {
      await recordCopilotAudit(scope, "chat_blocked", { reason: guardrail.reason });
      narrativeStatus = "REDACTION_BLOCKED";
      reply = `I held that request locally — the redaction guard tripped on "${guardrail.reason}". Here is the deterministic answer instead:\n\n${snapshot.bulletSummary}`;
    } else {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: DEFAULT_MODEL,
            messages,
            temperature: 0.2,
            max_tokens: COPILOT_MAX_OUTPUT_TOKENS,
          }),
        });
        if (!res.ok) {
          narrativeStatus = "PROVIDER_ERROR";
          reply = `AI provider returned ${res.status}. Deterministic summary:\n\n${snapshot.bulletSummary}`;
          await recordCopilotAudit(scope, "chat_provider_error", { status: res.status });
        } else {
          const data = (await res.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          reply = data.choices?.[0]?.message?.content?.trim() ?? snapshot.bulletSummary;
          narrativeStatus = "OK";
          await recordCopilotAudit(scope, "chat_message_generated", { model: DEFAULT_MODEL });
          const wsId =
            scope.workspaceId?.trim() || (await resolveOwnerWorkspaceId(scope.userId).catch(() => null));
          if (wsId) {
            void recordAIUsage(wsId, estimateTokens(input.message + reply), "ai_copilot");
          }
        }
      } catch (e) {
        narrativeStatus = "PROVIDER_ERROR";
        reply = `AI provider error: ${e instanceof Error ? e.message : "unknown"}. Deterministic summary:\n\n${snapshot.bulletSummary}`;
      }
    }
  }

  await prisma.copilotMessage.create({
    data: {
      conversationId,
      role: "ASSISTANT",
      content: reply,
      redactionLevel: settings.redactionLevel,
      metadataJson: { narrativeStatus } as Prisma.InputJsonValue,
    },
  });

  return { conversationId, reply, narrativeStatus, contextSummary };
}

function buildDeterministicChatReply(question: string, bulletSummary: string): string {
  return [
    `AI narrative is currently disabled or unavailable. Here is the deterministic answer based on your workspace data:`,
    "",
    bulletSummary,
    "",
    `Question asked: ${question}`,
  ].join("\n");
}

export async function createCopilotActionDraft(
  scope: Scope,
  seed: CopilotActionDraftSeed,
  conversationId: string | null,
): Promise<{ id: string }> {
  const workspaceId = await scopeWorkspaceId(scope);
  const created = await prisma.copilotActionDraft.create({
    data: {
      userId: scope.userId,
      workspaceId: workspaceId ?? undefined,
      conversationId,
      actionType: seed.actionType,
      title: seed.title,
      description: seed.description,
      payloadJson: seed.payload as Prisma.InputJsonValue,
      status: "NEEDS_APPROVAL",
      createdBy: scope.email ?? "user",
    },
    select: { id: true },
  });
  await recordCopilotAudit(scope, "action_draft_created", {
    actionType: seed.actionType,
    id: created.id,
  });
  return created;
}

export async function setActionDraftStatus(
  scope: Scope,
  id: string,
  status: "APPROVED" | "REJECTED" | "CANCELLED",
  reason?: string,
): Promise<void> {
  await prisma.copilotActionDraft.update({
    where: { id },
    data: {
      status,
      approvedBy: status === "APPROVED" ? scope.email ?? "user" : undefined,
      rejectedReason: status === "REJECTED" ? reason ?? null : null,
    },
  });
  await recordCopilotAudit(
    scope,
    status === "APPROVED"
      ? "action_draft_approved"
      : status === "REJECTED"
      ? "action_draft_rejected"
      : "action_draft_cancelled",
    { id },
  );
}

export async function executeApprovedAction(
  scope: Scope,
  id: string,
): Promise<{ ok: boolean; reason?: string; summary?: string }> {
  const draft = await prisma.copilotActionDraft.findFirst({
    where: { id, userId: scope.userId },
  });
  if (!draft) return { ok: false, reason: "not_found" };
  if (draft.status !== "APPROVED") return { ok: false, reason: "not_approved" };

  const actionType = draft.actionType as CopilotActionType;
  const payload = (draft.payloadJson ?? {}) as Record<string, unknown>;

  let summary = "Action draft marked executed (no side-effect tools were enabled).";

  // Side effects are intentionally minimal — KitchenTask is the safest
  // surface. Other action types remain as recorded drafts that humans
  // act on inside the relevant module.
  if (actionType === "create_task") {
    const title = typeof payload.title === "string" ? payload.title : draft.title;
    const description =
      typeof payload.description === "string" ? payload.description : draft.description;
    const dueAtRaw = typeof payload.dueAt === "string" ? payload.dueAt : null;
    const dueAt = dueAtRaw ? new Date(dueAtRaw) : null;
    await prisma.kitchenTask.create({
      data: {
        userId: scope.userId,
        title,
        description,
        status: "OPEN",
        taskType: "ADMIN",
        dueAt,
      },
    });
    summary = `Created kitchen task "${title}".`;
  }

  await prisma.copilotActionDraft.update({
    where: { id },
    data: { status: "EXECUTED", executedAt: new Date(), executedSummary: summary },
  });
  await recordCopilotAudit(scope, "action_draft_executed", { id, actionType });
  return { ok: true, summary };
}

export async function listConversations(scope: Scope, limit = 20) {
  return prisma.copilotConversation.findMany({
    where: { userId: scope.userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export async function listMessages(scope: Scope, conversationId: string) {
  // Ownership check
  const conv = await prisma.copilotConversation.findFirst({
    where: { id: conversationId, userId: scope.userId },
    select: { id: true },
  });
  if (!conv) return [];
  return prisma.copilotMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function listActionDrafts(scope: Scope, statuses?: string[]) {
  return prisma.copilotActionDraft.findMany({
    where: {
      userId: scope.userId,
      ...(statuses && statuses.length
        ? { status: { in: statuses as Prisma.EnumCopilotActionStatusFilter["in"] } }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
}

export async function listAuditEvents(scope: Scope, limit = 50) {
  return prisma.copilotAuditEvent.findMany({
    where: { userId: scope.userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function listOpenInsights(scope: Scope, limit = 25) {
  return prisma.copilotInsight.findMany({
    where: { userId: scope.userId, resolvedAt: null },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function resolveInsight(scope: Scope, id: string): Promise<void> {
  await prisma.copilotInsight.updateMany({
    where: { id, userId: scope.userId, resolvedAt: null },
    data: { resolvedAt: new Date() },
  });
  await recordCopilotAudit(scope, "insight_resolved", { id });
}
