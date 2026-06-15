import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import { promoteAllDueStorefrontThemes } from "@/lib/storefront/theme-schedule";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
    const promoted = await promoteAllDueStorefrontThemes();
    return NextResponse.json({ ok: true, promoted });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
