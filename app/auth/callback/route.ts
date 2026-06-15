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
import { resolvePostAuthPathForSessionUser } from "@/lib/navigation/resolve-operator-post-auth-path";
import { createClient } from "@/lib/supabase/server";

function loginSsoErrorRedirect(
  origin: string,
  errorCode: string,
  workspaceId?: string | null,
): NextResponse {
  const params = new URLSearchParams({ error: errorCode });
  if (workspaceId?.trim()) {
    params.set("workspaceId", workspaceId.trim());
  }
  return NextResponse.redirect(new URL(`/login?${params.toString()}`, origin));
}

async function finishAuthSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  origin: string,
  rawNext: string | null,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email) {
    await ensureAppUser(user.id, user.email);
  }
  const fallbackNext = user
    ? await resolvePostAuthPathForSessionUser(user.id)
    : "/dashboard/today";
  const next = safeInternalNextPath(rawNext, fallbackNext);
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
          return loginSsoErrorRedirect(origin, "sso_denied", workspaceId);
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
          return loginSsoErrorRedirect(origin, ssoResult.loginErrorCode, workspaceId);
        }
      }
      return finishAuthSession(supabase, origin, rawNext);
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
      return finishAuthSession(supabase, origin, rawNext);
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=confirmation_failed", origin),
  );
}
