import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import { recheckAllStorefrontDomains } from "@/services/storefront/storefront-domain-recheck-cron-service";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
    const result = await recheckAllStorefrontDomains();
    return NextResponse.json({ ok: true, ...result });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
