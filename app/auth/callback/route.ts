import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { ensureAppUser } from "@/lib/auth";
import { safeInternalNextPath } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/server";

async function finishAuthSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  origin: string,
  next: string,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email) {
    await ensureAppUser(user.id, user.email);
  }
  return NextResponse.redirect(new URL(next, origin));
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const rawNext = searchParams.get("next");

  const next = safeInternalNextPath(rawNext, "/dashboard/today");
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return finishAuthSession(supabase, origin, next);
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(new URL("/dashboard/settings", origin));
      }
      return finishAuthSession(supabase, origin, next);
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=confirmation_failed", origin),
  );
}
