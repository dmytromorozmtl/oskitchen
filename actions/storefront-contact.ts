"use server";


import { fail, ok } from "@/lib/action-result";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import { enforceStorefrontRateLimit } from "@/lib/storefront/storefront-rate-limit";
import { verifyTurnstileToken } from "@/lib/storefront/turnstile";

const contactSchema = z.object({
  storeSlug: z.string().min(2).max(120),
  type: z.enum(["CONTACT", "CATERING"]),
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  message: z.string().min(1).max(4000),
  company: z.string().max(200).optional(),
  eventDate: z.string().max(40).optional(),
  guestCount: z.string().max(20).optional(),
  budget: z.string().max(80).optional(),
  /** Honeypot — bots fill this; humans leave it empty. */
  companyUrl: z.string().max(200).optional(),
  captchaToken: z.string().max(4096).optional(),
});

export async function submitStorefrontContact(raw: unknown) {
  try {
    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) return { error: "Please check the form and try again." };
    const d = parsed.data;
    if (d.companyUrl?.trim()) {
      return { ok: true as const };
    }

    const rate = await enforceStorefrontRateLimit("storefront_contact_submit", {
      scopeSuffix: d.storeSlug,
    });
    if (!rate.ok) {
      return { error: rate.message };
    }

    const captcha = await verifyTurnstileToken(d.captchaToken);
    if (!captcha.ok) {
      return { error: captcha.error };
    }

    const sf = await prisma.storefrontSettings.findUnique({
      where: { storeSlug: d.storeSlug },
      select: { id: true, enabled: true, published: true },
    });
    if (!sf?.enabled || !sf.published) {
      return { error: "This storefront is not accepting messages right now." };
    }

    const metadata =
      d.type === "CATERING"
        ? {
            company: d.company,
            eventDate: d.eventDate,
            guestCount: d.guestCount,
            budget: d.budget,
          }
        : undefined;

    await prisma.storefrontContactSubmission.create({
      data: {
        storefrontId: sf.id,
        name: d.name.trim(),
        email: d.email.trim(),
        phone: d.phone?.trim() || null,
        message: d.message.trim(),
        type: d.type,
        metadataJson: metadata ?? undefined,
      },
    });

    await prisma.storefrontConversionEvent.create({
      data: {
        storefrontId: sf.id,
        eventName: d.type === "CATERING" ? "catering_submit" : "contact_submitted",
        metadataJson: { type: d.type },
      },
    });

    revalidateStorefrontDashboardAndPublic(d.storeSlug);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
