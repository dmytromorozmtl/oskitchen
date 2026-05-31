import { NextResponse } from "next/server";

import { getCapitalPartnerBySlug } from "@/lib/commercial/capital-partners";
import {
  resolveCapitalLenderWebhookSecret,
  verifyCapitalLenderPartnerPull,
} from "@/lib/commercial/capital-lender-offers";
import { revenueAttestationToDownloadJson } from "@/services/commercial/revenue-attestation-service";
import { loadSharedAttestationForPartner } from "@/services/commercial/capital-lender-offers-service";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const shareToken = token?.trim();
  if (!shareToken) {
    return NextResponse.json({ error: "Missing share token." }, { status: 400 });
  }

  const url = new URL(request.url);
  const partnerSlug = url.searchParams.get("partnerSlug")?.trim();
  if (!partnerSlug) {
    return NextResponse.json({ error: "Missing partnerSlug query parameter." }, { status: 400 });
  }

  const partner = getCapitalPartnerBySlug(partnerSlug);
  if (!partner?.offersEnabled) {
    return NextResponse.json({ error: "Unknown financing partner." }, { status: 404 });
  }

  const secret = resolveCapitalLenderWebhookSecret(partner);
  if (!secret) {
    return NextResponse.json({ error: "Partner integration is not configured." }, { status: 503 });
  }

  const signature =
    request.headers.get("X-KitchenOS-Capital-Signature") ??
    request.headers.get("x-kitchenos-capital-signature");

  if (!verifyCapitalLenderPartnerPull(partnerSlug, shareToken, signature, secret)) {
    return NextResponse.json({ error: "Invalid partner signature." }, { status: 401 });
  }

  try {
    const shared = await loadSharedAttestationForPartner({ shareToken, partnerSlug });
    if (!shared) {
      return NextResponse.json({ error: "Share link expired or not found." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      referralId: shared.referralId,
      partnerSlug: shared.partnerSlug,
      attestation: JSON.parse(revenueAttestationToDownloadJson(shared.document)),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
