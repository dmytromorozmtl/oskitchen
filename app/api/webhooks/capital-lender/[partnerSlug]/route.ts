import { CapitalPartnerReferralStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCapitalPartnerBySlug } from "@/lib/commercial/capital-partners";
import {
  resolveCapitalLenderWebhookSecret,
  verifyCapitalLenderWebhookSignature,
} from "@/lib/commercial/capital-lender-offers";
import { applyCapitalLenderWebhookUpdate } from "@/services/commercial/capital-lender-offers-service";

type RouteContext = { params: Promise<{ partnerSlug: string }> };

const webhookBodySchema = z.object({
  referralId: z.string().uuid(),
  status: z.nativeEnum(CapitalPartnerReferralStatus),
  offerId: z.string().max(128).optional().nullable(),
  offerTitle: z.string().max(255).optional().nullable(),
  offerSummary: z.string().max(500).optional().nullable(),
  offerDeepLink: z.string().max(2000).optional().nullable(),
});

export async function POST(request: Request, context: RouteContext) {
  const { partnerSlug } = await context.params;
  const slug = partnerSlug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing partner slug." }, { status: 400 });
  }

  const partner = getCapitalPartnerBySlug(slug);
  if (!partner?.offersEnabled) {
    return NextResponse.json({ error: "Unknown financing partner." }, { status: 404 });
  }

  const secret = resolveCapitalLenderWebhookSecret(partner);
  if (!secret) {
    return NextResponse.json({ error: "Partner webhook is not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature =
    request.headers.get("X-KitchenOS-Capital-Signature") ??
    request.headers.get("x-kitchenos-capital-signature");

  if (!verifyCapitalLenderWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = webhookBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const result = await applyCapitalLenderWebhookUpdate({
    partnerSlug: slug,
    referralId: parsed.data.referralId,
    status: parsed.data.status,
    offerId: parsed.data.offerId,
    offerTitle: parsed.data.offerTitle,
    offerSummary: parsed.data.offerSummary,
    offerDeepLink: parsed.data.offerDeepLink,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
