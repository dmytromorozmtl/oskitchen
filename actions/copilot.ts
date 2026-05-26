"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createCopilotActorScope } from "@/lib/ai/copilot-actor-scope";
import { canUseCopilot } from "@/lib/ai/copilot-permissions";
import type { CopilotActorScope } from "@/lib/ai/copilot-types";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import {
  createCopilotActionDraft,
  executeApprovedAction,
  persistDeterministicInsights,
  resolveInsight,
  runChatTurn,
  setActionDraftStatus,
  upsertCopilotSettings,
} from "@/services/ai/copilot-service";

const COPILOT_PATH = "/dashboard/copilot";

function scopeFor(
  actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>,
): CopilotActorScope & {
  userId: string;
  workspaceId?: string | null;
  email: string | null;
} {
  return createCopilotActorScope(actor);
}

const chatSchema = z.object({
  conversationId: z.string().uuid().nullish(),
  message: z.string().min(1).max(2000),
});

export async function chatTurnAction(
  input: z.infer<typeof chatSchema>,
): Promise<{ ok: boolean; conversationId?: string; reply?: string; status?: string; error?: string }> {
  try {
    const actor = await requireWorkspacePermissionActor();
    const scope = scopeFor(actor);
    if (!canUseCopilot(scope, "copilot.chat")) {
      return { ok: false, error: "Forbidden" };
    }
    const parsed = chatSchema.parse(input);
    const result = await runChatTurn(scope, {
      conversationId: parsed.conversationId ?? null,
      message: parsed.message,
    });
    revalidatePath(`${COPILOT_PATH}/chat`);
    return {
      ok: true,
      conversationId: result.conversationId,
      reply: result.reply,
      status: result.narrativeStatus,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unable to send" };
  }
}

const draftSchema = z.object({
  actionType: z.enum([
    "create_task",
    "create_follow_up",
    "create_purchasing_reminder",
    "draft_production_note",
    "draft_customer_follow_up_note",
    "draft_catering_quote_follow_up",
    "draft_route_issue_task",
    "suggest_menu_adjustment",
    "suggest_ingredient_demand_run",
    "suggest_report_export",
  ]),
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(2000),
  payloadJson: z.string().optional(),
  conversationId: z.string().uuid().nullish(),
});

export async function createActionDraftAction(formData: FormData): Promise<void> {
  const actor = await requireWorkspacePermissionActor();
  const scope = scopeFor(actor);
  if (!canUseCopilot(scope, "copilot.actions.draft")) return;
  const parsed = draftSchema.parse({
    actionType: String(formData.get("actionType") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    payloadJson: (formData.get("payloadJson") as string) || undefined,
    conversationId: (formData.get("conversationId") as string) || undefined,
  });
  let payload: Record<string, unknown> = {};
  if (parsed.payloadJson) {
    try {
      payload = JSON.parse(parsed.payloadJson) as Record<string, unknown>;
    } catch {
      payload = { raw: parsed.payloadJson };
    }
  }
  await createCopilotActionDraft(
    scope,
    {
      actionType: parsed.actionType,
      title: parsed.title,
      description: parsed.description,
      payload,
    },
    parsed.conversationId ?? null,
  );
  revalidatePath(`${COPILOT_PATH}/drafts`);
  revalidatePath(COPILOT_PATH);
}

export async function approveActionDraftFormAction(formData: FormData): Promise<void> {
  const actor = await requireWorkspacePermissionActor();
  const scope = scopeFor(actor);
  if (!canUseCopilot(scope, "copilot.actions.approve")) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await setActionDraftStatus(scope, id, "APPROVED");
  revalidatePath(`${COPILOT_PATH}/drafts`);
}

export async function rejectActionDraftFormAction(formData: FormData): Promise<void> {
  const actor = await requireWorkspacePermissionActor();
  const scope = scopeFor(actor);
  if (!canUseCopilot(scope, "copilot.actions.approve")) return;
  const id = String(formData.get("id") ?? "");
  const reason = (formData.get("reason") as string) || undefined;
  if (!id) return;
  await setActionDraftStatus(scope, id, "REJECTED", reason);
  revalidatePath(`${COPILOT_PATH}/drafts`);
}

export async function executeActionDraftFormAction(formData: FormData): Promise<void> {
  const actor = await requireWorkspacePermissionActor();
  const scope = scopeFor(actor);
  if (!canUseCopilot(scope, "copilot.actions.approve")) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await executeApprovedAction(scope, id);
  revalidatePath(`${COPILOT_PATH}/drafts`);
}

export async function refreshDeterministicAction(): Promise<void> {
  const actor = await requireWorkspacePermissionActor();
  const scope = scopeFor(actor);
  if (!canUseCopilot(scope, "copilot.view")) return;
  await persistDeterministicInsights(scope);
  revalidatePath(COPILOT_PATH);
}

export async function resolveCopilotInsightFormAction(formData: FormData): Promise<void> {
  const actor = await requireWorkspacePermissionActor();
  const scope = scopeFor(actor);
  if (!canUseCopilot(scope, "copilot.view")) return;
  const id = String(formData.get("id") ?? "");
  if (id) {
    await resolveInsight(scope, id);
    revalidatePath(COPILOT_PATH);
  }
}

const settingsSchema = z.object({
  aiNarrativeEnabled: z.boolean().optional(),
  deterministicOnly: z.boolean().optional(),
  redactionLevel: z
    .enum(["NONE", "OPERATIONAL_SUMMARY", "PII_REDACTED", "FULL_INTERNAL_ALLOWED"])
    .optional(),
  requireApprovalAll: z.boolean().optional(),
  maxContextRows: z.number().int().min(5).max(500).optional(),
  summaryRetentionDays: z.number().int().min(1).max(365).optional(),
  privacyDisclaimer: z.string().max(2000).nullable().optional(),
});

export async function updateCopilotSettingsFormAction(formData: FormData): Promise<void> {
  const actor = await requireWorkspacePermissionActor();
  const scope = scopeFor(actor);
  if (!canUseCopilot(scope, "copilot.settings.manage")) return;
  const parsed = settingsSchema.parse({
    aiNarrativeEnabled: formData.get("aiNarrativeEnabled") != null
      ? formData.get("aiNarrativeEnabled") === "on"
      : undefined,
    deterministicOnly: formData.get("deterministicOnly") != null
      ? formData.get("deterministicOnly") === "on"
      : undefined,
    redactionLevel: (formData.get("redactionLevel") as string) || undefined,
    requireApprovalAll: formData.get("requireApprovalAll") != null
      ? formData.get("requireApprovalAll") === "on"
      : undefined,
    maxContextRows: formData.get("maxContextRows")
      ? Number(formData.get("maxContextRows"))
      : undefined,
    summaryRetentionDays: formData.get("summaryRetentionDays")
      ? Number(formData.get("summaryRetentionDays"))
      : undefined,
    privacyDisclaimer: (formData.get("privacyDisclaimer") as string) || undefined,
  });
  await upsertCopilotSettings(scope, parsed);
  revalidatePath(`${COPILOT_PATH}/settings`);
}
