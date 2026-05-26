import { NextRequest, NextResponse } from "next/server";

import { routeUsesDashboardSession } from "@/lib/api/route-registry";
import { createClient } from "@/lib/supabase/server";

export type ApiHandlerContext = {
  userId: string;
  email: string | null;
};

export type ApiSessionGuardResult =
  | { ok: true; context: ApiHandlerContext }
  | { ok: false; response: NextResponse };

export type ApiRouteHandler = (
  request: NextRequest,
  context: ApiHandlerContext,
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps dashboard/integration API handlers with a Supabase session check.
 * Webhooks, crons, public API, and storefront routes are exempt (see isApiAuthExempt).
 */
export async function requireApiSession(): Promise<ApiSessionGuardResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const profile = await import("@/lib/prisma").then(({ prisma }) =>
    prisma.userProfile.findUnique({
      where: { id: user.id },
      select: { deletedAt: true },
    }),
  );
  if (profile?.deletedAt) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Account deactivated" }, { status: 403 }),
    };
  }

  return {
    ok: true,
    context: {
      userId: user.id,
      email: user.email ?? null,
    },
  };
}

export function withApiGuard(handler: ApiRouteHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const pathname = request.nextUrl.pathname;
    if (!routeUsesDashboardSession(pathname)) {
      return handler(request, { userId: "exempt", email: null });
    }

    const session = await requireApiSession();
    if (!session.ok) {
      return session.response;
    }
    return handler(request, session.context);
  };
}
