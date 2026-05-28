"use server";


import { fail, ok } from "@/lib/action-result";
import { AppFeedbackPriority, AppFeedbackType } from "@prisma/client";
import { z } from "zod";

import { requireAppFeedbackSubmit } from "@/lib/feedback/require-app-feedback-submit";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";

const schema = z.object({
  type: z.nativeEnum(AppFeedbackType),
  title: z.string().min(2).max(200),
  message: z.string().min(4).max(8000),
  route: z.string().max(512),
  featureArea: z.string().max(120).optional().or(z.literal("")),
});

export async function submitAppFeedback(formData: FormData) {
  try {
    const hp = formData.get("feedback_hp")?.toString().trim();
    if (hp) return { ok: true as const };

    const gate = await requireAppFeedbackSubmit();
    if (!gate.ok) {
      return { error: gate.error };
    }

    const parsed = schema.safeParse({
      type: formData.get("type"),
      title: formData.get("title"),
      message: formData.get("message"),
      route: formData.get("route") ?? "",
      featureArea: formData.get("featureArea"),
    });

    if (!parsed.success) {
      return { error: "Please complete the form." };
    }

    const d = parsed.data;
    await prisma.appFeedback.create({
      data: {
        userId: gate.userId,
        email: gate.email?.toLowerCase() ?? null,
        type: d.type,
        title: d.title.trim(),
        message: d.message.trim(),
        route: d.route.trim() || "/",
        featureArea: d.featureArea?.trim() || null,
        priority: AppFeedbackPriority.MEDIUM,
      },
    });

    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
