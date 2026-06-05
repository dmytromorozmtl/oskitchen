import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import {
  completeHomebaseOAuth,
  verifyHomebaseOAuthState,
} from "@/services/integrations/homebase/homebase-live-service";

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const livePath = "/dashboard/integrations/homebase/live";

  if (error) {
    return NextResponse.redirect(
      new URL(`${livePath}?oauth_error=${encodeURIComponent(error)}`, request.url),
    );
  }

  if (!code?.trim() || !state?.trim()) {
    return NextResponse.redirect(new URL(`${livePath}?oauth_error=missing_code`, request.url));
  }

  const verified = verifyHomebaseOAuthState(state);
  if (!verified || verified.userId !== session.id) {
    return NextResponse.redirect(new URL(`${livePath}?oauth_error=invalid_state`, request.url));
  }

  const result = await completeHomebaseOAuth({
    userId: verified.userId,
    connectionId: verified.connectionId,
    code: code.trim(),
  });

  if (!result.ok) {
    return NextResponse.redirect(
      new URL(`${livePath}?oauth_error=${encodeURIComponent(result.error)}`, request.url),
    );
  }

  return NextResponse.redirect(new URL(`${livePath}?oauth=connected`, request.url));
}
