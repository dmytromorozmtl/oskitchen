"use server";


import { fail, ok } from "@/lib/action-result";
import { BusinessType } from "@prisma/client";
import { cookies, headers } from "next/headers";
import { subDays, subHours } from "date-fns";
import { z } from "zod";

import { computeBetaProgramScores } from "@/lib/beta/beta-fit-scoring";
import { notifyGrowthInbound } from "@/lib/growth/growth-notify";
import { consumeRateLimitToken } from "@/services/security/rate-limit-service";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";

const channelSlug = z.enum([
  "manual",
  "woocommerce",
  "shopify",
  "uber_eats",
  "doordash",
  "square",
  "toast",
  "other",
]);

const optionalInt = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().int().min(0).max(99_999).optional(),
);

const schema = z.object({
  fullName: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  businessName: z.string().min(1).max(200),
  businessWebsite: z.string().max(500).optional().or(z.literal("")),
  businessType: z.nativeEnum(BusinessType),
  weeklyOrderVolume: z.string().max(160).optional().or(z.literal("")),
  biggestPain: z.string().max(4000).optional().or(z.literal("")),
  country: z.string().max(120).optional().or(z.literal("")),
  timezone: z.string().max(120).optional().or(z.literal("")),
  channels: z.array(channelSlug).default([]),
  interestedFeaturesText: z.string().max(4000).optional().or(z.literal("")),
  source: z.string().max(120).optional().or(z.literal("")),
  locationsCount: optionalInt,
  teamSize: optionalInt,
  referralSource: z.string().max(160).optional().or(z.literal("")),
  onboardingUrgency: z.string().max(80).optional().or(z.literal("")),
  integrationsNeeded: z.string().max(4000).optional().or(z.literal("")),
  languages: z.string().max(500).optional().or(z.literal("")),
  utmSource: z.string().max(120).optional().or(z.literal("")),
  utmMedium: z.string().max(120).optional().or(z.literal("")),
  utmCampaign: z.string().max(120).optional().or(z.literal("")),
});

function parseChannels(formData: FormData): string[] {
  const raw = formData.getAll("channels");
  const parsed: string[] = [];
  for (const r of raw) {
    const s = String(r).trim();
    const check = channelSlug.safeParse(s);
    if (check.success) parsed.push(check.data);
  }
  return parsed.length ? parsed : ["manual"];
}

function parseInterestedFeatures(text: string): string[] {
  return text
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 40);
}

/** Public beta waitlist — persists `BetaLead`, scores, optional founder email. */
export async function submitBetaApplication(formData: FormData) {
  try {
    const hp = formData.get("website_hp")?.toString().trim();
    if (hp) {
      return { ok: true as const };
    }

    const consent = formData.get("consent")?.toString();
    if (consent !== "on") {
      return { error: "Please confirm consent to proceed." };
    }

    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip")?.trim() ||
      "unknown";
    const rl = await consumeRateLimitToken(`beta_apply:${ip}`, "beta_application");
    if (!rl.ok) {
      return { error: "Too many submissions from this network. Please try again in a few minutes." };
    }

    const channels = parseChannels(formData);
    const interestedRaw = String(formData.get("interestedFeatures") ?? "");

    const parsed = schema.safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      businessName: formData.get("businessName"),
      businessWebsite: formData.get("businessWebsite"),
      businessType: formData.get("businessType"),
      weeklyOrderVolume: formData.get("weeklyOrderVolume"),
      biggestPain: formData.get("biggestPain"),
      country: formData.get("country"),
      timezone: formData.get("timezone"),
      channels,
      interestedFeaturesText: interestedRaw,
      source: formData.get("source"),
      locationsCount: formData.get("locationsCount"),
      teamSize: formData.get("teamSize"),
      referralSource: formData.get("referralSource"),
      onboardingUrgency: formData.get("onboardingUrgency"),
      integrationsNeeded: formData.get("integrationsNeeded"),
      languages: formData.get("languages"),
      utmSource: formData.get("utmSource"),
      utmMedium: formData.get("utmMedium"),
      utmCampaign: formData.get("utmCampaign"),
    });

    if (!parsed.success) {
      return { error: "Please check required fields and try again." };
    }

    const d = parsed.data;
    const interestedFeatures = parseInterestedFeatures(
      d.interestedFeaturesText ?? "",
    );

    const emailNorm = d.email.trim().toLowerCase();

    const dupWindow = await prisma.betaLead.findFirst({
      where: {
        email: emailNorm,
        createdAt: { gte: subHours(new Date(), 2) },
      },
      select: { id: true },
    });
    if (dupWindow) {
      return { ok: true as const };
    }

    const dayCount = await prisma.betaLead.count({
      where: { email: emailNorm, createdAt: { gte: subDays(new Date(), 1) } },
    });
    if (dayCount >= 8) {
      return {
        error: "Too many submissions from this email in 24 hours. Please try again tomorrow.",
      };
    }

    const scores = computeBetaProgramScores({
      weeklyOrderVolume: d.weeklyOrderVolume,
      businessType: d.businessType,
      currentChannels: channels,
      biggestPain: d.biggestPain,
      interestedFeatures,
      country: d.country,
      businessWebsite: d.businessWebsite,
      locationsCount: d.locationsCount ?? null,
      teamSize: d.teamSize ?? null,
      onboardingUrgency: d.onboardingUrgency,
      integrationsNeeded: d.integrationsNeeded,
    });

    const cookieStore = await cookies();
    const referralSnapshot =
      cookieStore.get("kos_ref")?.value?.slice(0, 80) ?? null;

    await prisma.betaLead.create({
      data: {
        fullName: d.fullName.trim(),
        email: emailNorm,
        phone: d.phone?.trim() || null,
        businessName: d.businessName.trim(),
        businessWebsite: d.businessWebsite?.trim() || null,
        businessType: d.businessType,
        currentChannels: channels,
        weeklyOrderVolume: d.weeklyOrderVolume?.trim() || null,
        biggestPain: d.biggestPain?.trim() || null,
        interestedFeatures,
        country: d.country?.trim() || null,
        timezone: d.timezone?.trim() || null,
        consent: true,
        source: d.source?.trim() || "beta_page",
        referralSnapshot,
        utmSource: d.utmSource?.trim() || null,
        utmMedium: d.utmMedium?.trim() || null,
        utmCampaign: d.utmCampaign?.trim() || null,
        locationsCount: d.locationsCount ?? null,
        teamSize: d.teamSize ?? null,
        referralSource: d.referralSource?.trim() || null,
        onboardingUrgency: d.onboardingUrgency?.trim() || null,
        integrationsNeeded: d.integrationsNeeded?.trim() || null,
        languages: d.languages?.trim() || null,
        score: scores.fitScore,
        expansionScore: scores.expansionScore,
        activationProbability: scores.activationProbability,
        riskScore: scores.riskScore,
        onboardingReadiness: scores.onboardingReadiness,
        expansionPotential: scores.expansionPotential,
        onboardingComplexity: scores.onboardingComplexity,
        estimatedOnboardingDays: scores.estimatedOnboardingDays,
        arrPotentialScore: scores.arrPotentialScore,
        programStage: "NEW",
        lastActivityAt: new Date(),
      },
    });

    void notifyGrowthInbound(
      `New beta lead: ${d.businessName}`,
      [
        `Name: ${d.fullName}`,
        `Email: ${d.email}`,
        `Business: ${d.businessName} (${d.businessType})`,
        `Fit score: ${scores.fitScore} (${scores.qualificationLabel})`,
        `Activation: ${scores.activationProbability} · Risk: ${scores.riskScore} · ARR proxy: ${scores.arrPotentialScore}`,
        `Channels: ${channels.join(", ")}`,
        `Volume: ${d.weeklyOrderVolume ?? "—"}`,
        `Pain: ${d.biggestPain ?? "—"}`,
        `Features: ${interestedFeatures.join("; ") || "—"}`,
        `Locations: ${d.locationsCount ?? "—"} · Team: ${d.teamSize ?? "—"}`,
        `Referral: ${d.referralSource || "—"} · UTM: ${d.utmSource || "—"} / ${d.utmCampaign || "—"}`,
      ].join("\n"),
    );

    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
