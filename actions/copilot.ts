"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCopilotMutation } from "@/lib/ai/require-copilot-mutation";
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

const chatSchema = z.object({
  conversationId: z.string().uuid().nullish(),
  message: z.string().min(1).max(2000),
});

export async function chatTurnAction(
  input: z.infer<typeof chatSchema>,
): Promise<{ ok: boolean; conversationId?: string; reply?: string; status?: string; error?: string }> {
  try {
    const gate = await requireCopilotMutation({
      capability: "copilot.chat",
      operation: "copilot.chat_turn",
    });
    if (!gate.ok) {
      return { ok: false, error: gate.error };
    }
    const parsed = chatSchema.parse(input);
    const result = await runChatTurn(gate.scope, {
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
  const gate = await requireCopilotMutation({
    capability: "copilot.actions.draft",
    operation: "copilot.create_action_draft",
  });
  if (!gate.ok) return;
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
    gate.scope,
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
  const gate = await requireCopilotMutation({
    capability: "copilot.actions.approve",
    operation: "copilot.approve_action_draft",
  });
  if (!gate.ok) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await setActionDraftStatus(gate.scope, id, "APPROVED");
  revalidatePath(`${COPILOT_PATH}/drafts`);
}

export async function rejectActionDraftFormAction(formData: FormData): Promise<void> {
  const gate = await requireCopilotMutation({
    capability: "copilot.actions.approve",
    operation: "copilot.reject_action_draft",
  });
  if (!gate.ok) return;
  const id = String(formData.get("id") ?? "");
  const reason = (formData.get("reason") as string) || undefined;
  if (!id) return;
  await setActionDraftStatus(gate.scope, id, "REJECTED", reason);
  revalidatePath(`${COPILOT_PATH}/drafts`);
}

export async function executeActionDraftFormAction(formData: FormData): Promise<void> {
  const gate = await requireCopilotMutation({
    capability: "copilot.actions.approve",
    operation: "copilot.execute_action_draft",
  });
  if (!gate.ok) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await executeApprovedAction(gate.scope, id);
  revalidatePath(`${COPILOT_PATH}/drafts`);
}

export async function refreshDeterministicAction(): Promise<void> {
  const gate = await requireCopilotMutation({
    capability: "copilot.view",
    operation: "copilot.refresh_deterministic",
  });
  if (!gate.ok) return;
  await persistDeterministicInsights(gate.scope);
  revalidatePath(COPILOT_PATH);
}

export async function resolveCopilotInsightFormAction(formData: FormData): Promise<void> {
  const gate = await requireCopilotMutation({
    capability: "copilot.view",
    operation: "copilot.resolve_insight",
  });
  if (!gate.ok) return;
  const id = String(formData.get("id") ?? "");
  if (id) {
    await resolveInsight(gate.scope, id);
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
  const gate = await requireCopilotMutation({
    capability: "copilot.settings.manage",
    operation: "copilot.update_settings",
  });
  if (!gate.ok) return;
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
  await upsertCopilotSettings(gate.scope, parsed);
  revalidatePath(`${COPILOT_PATH}/settings`);
}
