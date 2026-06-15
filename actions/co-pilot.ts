"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { requireCopilotMutation } from "@/lib/ai/require-copilot-mutation";
import type { CoPilotCategory } from "@/lib/ai/co-pilot-types";
import {
  approveCoPilotDraft,
  executeCoPilotDraft,
  getRestaurantCoPilotDashboard,
  promoteCoPilotRecommendation,
  rejectCoPilotDraft,
  scanRestaurantCoPilotRecommendations,
} from "@/services/ai/co-pilot-service";

const CO_PILOT_PATH = "/dashboard/ai/co-pilot";

const promoteSchema = z.object({
  recommendationId: z.string().min(1),
  category: z.enum(["procurement", "scheduling", "pricing"]),
});

export async function refreshCoPilotDashboardAction() {
  try {
    const gate = await requireCopilotMutation({
      capability: "copilot.view",
      operation: "co_pilot.refresh",
    });
    if (!gate.ok) return fail(gate.error);

    const dashboard = await getRestaurantCoPilotDashboard(gate.scope.userId);
    revalidatePath(CO_PILOT_PATH);
    return ok(dashboard);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Unable to refresh Co-Pilot.");
  }
}

export async function promoteCoPilotRecommendationAction(formData: FormData) {
  try {
    const gate = await requireCopilotMutation({
      capability: "copilot.actions.draft",
      operation: "co_pilot.promote",
    });
    if (!gate.ok) return fail(gate.error);

    const parsed = promoteSchema.safeParse({
      recommendationId: String(formData.get("recommendationId") ?? ""),
      category: String(formData.get("category") ?? ""),
    });
    if (!parsed.success) return fail("Invalid recommendation.");

    const recommendations = await scanRestaurantCoPilotRecommendations(gate.scope.userId);
    const recommendation = recommendations.find((r) => r.id === parsed.data.recommendationId);
    if (!recommendation || recommendation.category !== parsed.data.category) {
      return fail("Recommendation expired — refresh and try again.");
    }

    const { draftId } = await promoteCoPilotRecommendation(gate.scope, recommendation);
    revalidatePath(CO_PILOT_PATH);
    revalidatePath("/dashboard/copilot/drafts");
    return ok({ draftId, message: "Draft created — awaiting your approval." });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Unable to create draft.");
  }
}

export async function approveCoPilotDraftAction(formData: FormData) {
  try {
    const gate = await requireCopilotMutation({
      capability: "copilot.actions.approve",
      operation: "co_pilot.approve",
    });
    if (!gate.ok) return fail(gate.error);

    const draftId = String(formData.get("draftId") ?? "");
    if (!draftId) return fail("Missing draft id.");

    await approveCoPilotDraft(gate.scope, draftId);
    revalidatePath(CO_PILOT_PATH);
    revalidatePath("/dashboard/copilot/drafts");
    return ok({ message: "Approved — you can execute when ready." });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Unable to approve.");
  }
}

export async function rejectCoPilotDraftAction(formData: FormData) {
  try {
    const gate = await requireCopilotMutation({
      capability: "copilot.actions.approve",
      operation: "co_pilot.reject",
    });
    if (!gate.ok) return fail(gate.error);

    const draftId = String(formData.get("draftId") ?? "");
    const reason = String(formData.get("reason") ?? "") || undefined;
    if (!draftId) return fail("Missing draft id.");

    await rejectCoPilotDraft(gate.scope, draftId, reason);
    revalidatePath(CO_PILOT_PATH);
    return ok({ message: "Suggestion dismissed." });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Unable to reject.");
  }
}

export async function executeCoPilotDraftAction(formData: FormData) {
  try {
    const gate = await requireCopilotMutation({
      capability: "copilot.actions.approve",
      operation: "co_pilot.execute",
    });
    if (!gate.ok) return fail(gate.error);

    const draftId = String(formData.get("draftId") ?? "");
    if (!draftId) return fail("Missing draft id.");

    const result = await executeCoPilotDraft(gate.scope, draftId);
    if (!result.ok) return fail(result.reason ?? "Execute failed.");

    revalidatePath(CO_PILOT_PATH);
    revalidatePath("/dashboard/copilot/drafts");
    return ok({ message: result.summary ?? "Executed." });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Unable to execute.");
  }
}

export type { CoPilotCategory };
