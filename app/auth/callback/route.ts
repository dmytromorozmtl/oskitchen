import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { ensureAppUser } from "@/lib/auth";
import { safeInternalNextPath } from "@/lib/auth/safe-redirect";
import { completeWorkspaceSsoCallback } from "@/lib/enterprise/workspace-sso-callback-service";
import {
  isSsoCallbackRequest,
  parseSsoCallbackWorkspaceId,
  SSO_CALLBACK_WORKSPACE_QUERY_PARAM,
} from "@/lib/enterprise/workspace-sso-runtime-adapter";
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
  // Pilot SSO uses `sso_workspace_id` query param (see SSO_CALLBACK_WORKSPACE_QUERY_PARAM).
  void SSO_CALLBACK_WORKSPACE_QUERY_PARAM;
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
      if (isSsoCallbackRequest(searchParams)) {
        const workspaceId = parseSsoCallbackWorkspaceId(searchParams)!;
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL("/login?error=sso_denied", origin));
        }
        const ssoResult = await completeWorkspaceSsoCallback({
          workspaceId,
          user,
          requestMeta: {
            ipAddress: request.headers.get("x-forwarded-for"),
            userAgent: request.headers.get("user-agent"),
          },
        });
        if (!ssoResult.ok) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            new URL(`/login?error=${ssoResult.loginErrorCode}`, origin),
          );
        }
      }
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
