import type { NextRequest } from "next/server";

import { authenticateScimRequest } from "@/lib/scim/scim-auth";
import { enforceScimRateLimit } from "@/lib/scim/scim-rate-limit";
import { scimErrorResponse } from "@/lib/scim/scim-response";

export async function requireScimContext(request: NextRequest) {
  const auth = await authenticateScimRequest(request.headers.get("authorization"));
  if (!auth.ok) {
    return {
      ok: false as const,
      response: scimErrorResponse({ status: auth.status, detail: auth.detail }),
    };
  }

  const rate = enforceScimRateLimit(auth.context.workspaceId);
  if (!rate.ok) {
    return {
      ok: false as const,
      response: scimErrorResponse({
        status: 429,
        detail: "SCIM rate limit exceeded",
      }),
    };
  }

  return { ok: true as const, context: auth.context };
}
