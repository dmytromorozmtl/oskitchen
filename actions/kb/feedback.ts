"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { recordKbArticleFeedback } from "@/services/kb/knowledge-base-service";

const feedbackSchema = z.object({
  articleSlug: z.string().min(1).max(120),
  helpful: z.enum(["true", "false"]),
});

export async function submitKbFeedbackAction(formData: FormData) {
  const parsed = feedbackSchema.safeParse({
    articleSlug: formData.get("articleSlug"),
    helpful: formData.get("helpful"),
  });
  if (!parsed.success) return fail("Invalid feedback.");

  const stats = recordKbArticleFeedback(
    parsed.data.articleSlug,
    parsed.data.helpful === "true",
  );
  revalidatePath(`/kb/${parsed.data.articleSlug}`);
  return ok({ stats });
}
