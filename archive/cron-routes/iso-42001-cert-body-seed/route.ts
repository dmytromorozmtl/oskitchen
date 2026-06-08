import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import { logger } from "@/lib/logger";
import { seedIso42001CertBodyForStorefronts } from "@/services/storefront/iso-42001-cert-body-seed-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(
    request,
    async () => {
      const result = await seedIso42001CertBodyForStorefronts();
      logger.info("iso_42001_cert_body_seed_cron", result);
      return NextResponse.json({ ok: true, ...result });
    },
    { experimental: true },
  );
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
