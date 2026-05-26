import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { remindStaleStorefrontInvites } from "@/services/storefront/storefront-team-invite-service";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
    const result = await remindStaleStorefrontInvites();
    return NextResponse.json({ ok: true, ...result });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
