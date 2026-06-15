"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { asVoidFormAction } from "@/lib/actions/server-form-action";
import { getSessionUser } from "@/lib/auth";
import { getRequestClientIp } from "@/lib/rate-limit/client-ip";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { consumeRateLimitToken } from "@/services/security/rate-limit-service";

const advisorySchema = z.object({
  fullName: z.string().min(2).max(255),
  email: z.string().email(),
  businessName: z.string().min(2).max(255),
  businessType: z.string().max(120).optional().or(z.literal("")),
  website: z.string().max(512).optional().or(z.literal("")),
  weeklyOrderVolume: z.string().max(120).optional().or(z.literal("")),
  whyInterested: z.string().max(4000).optional().or(z.literal("")),
});

export async function submitAdvisoryBoardApplication(formData: FormData) {
  try {
    if (String(formData.get("company_hp") ?? "").trim()) return { ok: true as const };
    const parsed = advisorySchema.safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      businessName: formData.get("businessName"),
      businessType: formData.get("businessType"),
      website: formData.get("website"),
      weeklyOrderVolume: formData.get("weeklyOrderVolume"),
      whyInterested: formData.get("whyInterested"),
    });
    if (!parsed.success) return { error: "Please check the advisory board application." };

    const ip = await getRequestClientIp();
    const rl = await consumeRateLimitToken(`advisory_board:${ip}`, "advisory_board");
    if (!rl.ok) {
      return { error: "Too many submissions from this network. Please try again in a few minutes." };
    }

    const session = await getSessionUser();
    const d = parsed.data;
    await prisma.advisoryBoardApplication.create({
      data: {
        userId: session?.id ?? null,
        fullName: d.fullName,
        email: d.email.toLowerCase(),
        businessName: d.businessName,
        businessType: d.businessType || null,
        website: d.website || null,
        weeklyOrderVolume: d.weeklyOrderVolume || null,
        whyInterested: d.whyInterested || null,
      },
    });
    revalidatePath("/dashboard/growth/advisory-board");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export const submitAdvisoryBoardApplicationFormAction = asVoidFormAction(submitAdvisoryBoardApplication);
