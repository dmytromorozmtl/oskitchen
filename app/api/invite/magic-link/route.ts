import { NextResponse } from "next/server";
import { z } from "zod";

import { authCallbackUrl } from "@/lib/auth/public-site-url";
import { createClient } from "@/lib/supabase/server";
import { enforceStorefrontRateLimitFromRequest } from "@/lib/storefront/storefront-rate-limit";
import { verifyTurnstileToken } from "@/lib/storefront/turnstile";
import { findInviteByToken } from "@/services/storefront/storefront-team-invite-service";
import { logStorefrontTeamInviteEvent } from "@/services/storefront/storefront-invite-audit";

const schema = z.object({
  token: z.string().min(16).max(128),
  email: z.string().email().max(255),
  captchaToken: z.string().optional(),
});

const GENERIC_OK = {
  ok: true as const,
  message:
    "If this email matches the invitation, we sent a sign-in link. Check your inbox and spam folder.",
};

/**
 * Anti-enumeration team invite sign-in: always returns the same message;
 * only sends OTP when email matches the invite row.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const captcha = await verifyTurnstileToken(parsed.data.captchaToken);
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error ?? "Security check failed." }, { status: 400 });
  }

  const rate = await enforceStorefrontRateLimitFromRequest(request, "storefront_invite_magic", "global");
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const token = parsed.data.token.trim();
  const email = parsed.data.email.trim().toLowerCase();

  const invite = await findInviteByToken(token);
  if (!invite || invite.acceptedAt) {
    return NextResponse.json(GENERIC_OK);
  }
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return NextResponse.json(GENERIC_OK);
  }

  const inviteEmail = invite.email.trim().toLowerCase();
  if (email !== inviteEmail) {
    return NextResponse.json(GENERIC_OK);
  }

  const next = `/invite/${encodeURIComponent(token)}`;
  const redirectTo = authCallbackUrl(next);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: inviteEmail,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  });

  if (error) {
    await logStorefrontTeamInviteEvent({
      eventType: "magic_link_failed",
      storefrontId: invite.storefrontId,
      workspaceId: invite.workspaceId,
      inviteId: invite.id,
      targetEmail: inviteEmail,
      metadata: { reason: error.message },
    });
    return NextResponse.json(GENERIC_OK);
  }

  await logStorefrontTeamInviteEvent({
    eventType: "magic_link_sent",
    storefrontId: invite.storefrontId,
    workspaceId: invite.workspaceId,
    inviteId: invite.id,
    targetEmail: inviteEmail,
  });

  return NextResponse.json(GENERIC_OK);
}
