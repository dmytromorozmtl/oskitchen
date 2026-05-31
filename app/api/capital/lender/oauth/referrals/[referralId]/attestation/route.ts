import { NextResponse } from "next/server";

import { getCapitalPartnerBySlug } from "@/lib/commercial/capital-partners";
import { isCapitalPartnerPullIpAllowed } from "@/lib/commercial/capital-lender-offers";
import { resolvePartnerOAuthCredential } from "@/lib/oauth/partner-oauth-auth";
import { getClientIpFromRequest } from "@/lib/rate-limit/client-ip";
import { revenueAttestationToDownloadJson } from "@/services/commercial/revenue-attestation-service";
import { loadAttestationForCapitalOAuthPull } from "@/services/commercial/capital-lender-oauth-service";

type RouteContext = { params: Promise<{ referralId: string }> };

/** OAuth bearer pull — alternative to HMAC share-token flow (Phase 6). */
export async function GET(request: Request, context: RouteContext) {
  const { referralId } = await context.params;
  const trimmedReferralId = referralId?.trim();
  if (!trimmedReferralId) {
    return NextResponse.json({ error: "Missing referralId." }, { status: 400 });
  }

  const url = new URL(request.url);
  const partnerSlug = url.searchParams.get("partnerSlug")?.trim();
  if (!partnerSlug) {
    return NextResponse.json({ error: "Missing partnerSlug query parameter." }, { status: 400 });
  }

  const partner = getCapitalPartnerBySlug(partnerSlug);
  if (!partner?.offersEnabled || !partner.oauthEnabled) {
    return NextResponse.json({ error: "Partner OAuth pull is not enabled." }, { status: 404 });
  }

  const credential = await resolvePartnerOAuthCredential(
    request.headers.get("authorization"),
  );
  if (!credential) {
    return NextResponse.json({ error: "Invalid or missing Bearer token." }, { status: 401 });
  }

  const clientIp = getClientIpFromRequest(request);
  if (!isCapitalPartnerPullIpAllowed(partner, clientIp)) {
    return NextResponse.json({ error: "Partner IP not allowlisted." }, { status: 403 });
  }

  try {
    const shared = await loadAttestationForCapitalOAuthPull({
      credential,
      referralId: trimmedReferralId,
      partnerSlug,
    });
    if (!shared) {
      return NextResponse.json({ error: "OAuth grant expired or not found." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      authMethod: "oauth",
      referralId: shared.referralId,
      partnerSlug: shared.partnerSlug,
      attestation: JSON.parse(revenueAttestationToDownloadJson(shared.document)),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
