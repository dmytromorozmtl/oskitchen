import { NextResponse } from "next/server";

import { timingSafeEqualText } from "@/lib/security/timing-safe";

export function requireStorefrontMiddlewareSecret(request: Request): NextResponse | null {
  const expected = process.env.STOREFRONT_MIDDLEWARE_SECRET?.trim();
  if (!expected) {
    return NextResponse.json({ error: "Storefront middleware secret not configured" }, { status: 503 });
  }

  const provided = request.headers.get("x-kos-mw-secret")?.trim();
  if (!provided || !timingSafeEqualText(provided, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
