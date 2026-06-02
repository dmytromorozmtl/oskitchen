import { NextResponse } from "next/server";

import { SITE_URL } from "@/lib/constants";
import { validateReferralCode } from "@/services/referral/referral-service";

const REF_COOKIE = "kos_ref";
const REF_MAX_AGE = 60 * 60 * 24 * 90;

type RouteContext = { params: Promise<{ code: string }> };

/**
 * Public referral short link — os-kitchen.com/r/{code}
 * Sets attribution cookie and sends visitors to signup.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { code: raw } = await context.params;
  const code = raw?.trim() ?? "";
  const valid = code.length >= 2 && code.length <= 64 && (await validateReferralCode(code));

  const signupUrl = new URL("/signup", SITE_URL);
  if (valid) {
    signupUrl.searchParams.set("ref", code.toUpperCase());
  }

  const response = NextResponse.redirect(signupUrl);
  if (valid && /^[a-zA-Z0-9_-]{2,64}$/.test(code)) {
    response.cookies.set(REF_COOKIE, code.toUpperCase(), {
      path: "/",
      maxAge: REF_MAX_AGE,
      sameSite: "lax",
      httpOnly: false,
    });
  }
  return response;
}
