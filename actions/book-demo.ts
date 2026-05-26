"use server";


import { fail, ok } from "@/lib/action-result";
import { BusinessType } from "@prisma/client";
import { z } from "zod";

import { notifyGrowthInbound } from "@/lib/growth/growth-notify";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { getRequestClientIp } from "@/lib/rate-limit/client-ip";
import { consumeRateLimitToken } from "@/services/security/rate-limit-service";

const schema = z.object({
  fullName: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  businessName: z.string().min(1).max(200),
  website: z.string().max(500).optional().or(z.literal("")),
  businessType: z.nativeEnum(BusinessType),
  currentPlatform: z.string().max(500).optional().or(z.literal("")),
  weeklyOrderVolume: z.string().max(160).optional().or(z.literal("")),
  painPoints: z.string().max(4000).optional().or(z.literal("")),
  preferredTime: z.string().max(255).optional().or(z.literal("")),
});

export async function submitDemoRequest(formData: FormData) {
  try {
    const hp = formData.get("company_hp")?.toString().trim();
    if (hp) {
      return { ok: true as const };
    }

    const ip = await getRequestClientIp();
    const rl = await consumeRateLimitToken(`book_demo:${ip}`, "book_demo");
    if (!rl.ok) {
      return { error: "Too many submissions from this network. Please try again in a few minutes." };
    }

    const parsed = schema.safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      businessName: formData.get("businessName"),
      website: formData.get("website"),
      businessType: formData.get("businessType"),
      currentPlatform: formData.get("currentPlatform"),
      weeklyOrderVolume: formData.get("weeklyOrderVolume"),
      painPoints: formData.get("painPoints"),
      preferredTime: formData.get("preferredTime"),
    });

    if (!parsed.success) {
      return { error: "Please check required fields and try again." };
    }

    const d = parsed.data;
    await prisma.demoRequest.create({
      data: {
        fullName: d.fullName.trim(),
        email: d.email.trim().toLowerCase(),
        phone: d.phone?.trim() || null,
        businessName: d.businessName.trim(),
        website: d.website?.trim() || null,
        businessType: d.businessType,
        currentPlatform: d.currentPlatform?.trim() || null,
        weeklyOrderVolume: d.weeklyOrderVolume?.trim() || null,
        painPoints: d.painPoints?.trim() || null,
        preferredTime: d.preferredTime?.trim() || null,
      },
    });

    void notifyGrowthInbound(
      `Demo request: ${d.businessName}`,
      [
        `Name: ${d.fullName}`,
        `Email: ${d.email}`,
        `Business: ${d.businessName}`,
        `Platform: ${d.currentPlatform ?? "—"}`,
        `Volume: ${d.weeklyOrderVolume ?? "—"}`,
        `Preferred time: ${d.preferredTime ?? "—"}`,
        `Pain: ${d.painPoints ?? "—"}`,
      ].join("\n"),
    );

    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
