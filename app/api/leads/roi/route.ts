import { NextResponse } from "next/server";
import { z } from "zod";

import { enforcePublicMarketingPostGuard } from "@/lib/api/public-post-guard";
import { notifyGrowthInbound } from "@/lib/growth/growth-notify";
import { prisma } from "@/lib/prisma";
import { BetaLeadStatus, BusinessType } from "@prisma/client";

const bodySchema = z.object({
  email: z.string().email(),
  businessType: z.string().max(80).optional(),
  ordersPerWeek: z.number().int().min(0).max(100_000).optional(),
  estimatedSavingsMonthly: z.number().min(0).optional(),
  captchaToken: z.string().optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const guardError = await enforcePublicMarketingPostGuard(req, {
    policyKey: "roi_lead",
    bucketPrefix: "roi_lead",
    captchaToken: parsed.data.captchaToken,
  });
  if (guardError) return guardError;

  const { email, businessType, ordersPerWeek, estimatedSavingsMonthly } = parsed.data;
  const biz =
    businessType && businessType in BusinessType
      ? (businessType as BusinessType)
      : BusinessType.MEAL_PREP;

  await prisma.betaLead.create({
    data: {
      email,
      fullName: "ROI calculator",
      businessName: "ROI lead",
      businessType: biz,
      currentChannels: [],
      interestedFeatures: ["roi_calculator"],
      weeklyOrderVolume: ordersPerWeek != null ? String(ordersPerWeek) : null,
      biggestPain: `ROI estimate ~$${Math.round(estimatedSavingsMonthly ?? 0)}/mo`,
      status: BetaLeadStatus.NEW,
      source: "roi_calculator",
      consent: true,
    },
  });

  await notifyGrowthInbound(
    "ROI calculator lead",
    `Email: ${email}\nBusiness: ${businessType ?? "—"}\nOrders/week: ${ordersPerWeek ?? "—"}\nEst. savings/mo: $${Math.round(estimatedSavingsMonthly ?? 0)}`,
  );

  return NextResponse.json({ ok: true });
}
