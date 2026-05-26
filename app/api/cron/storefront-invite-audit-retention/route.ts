import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { STOREFRONT_INVITE_AUDIT_RETENTION_DAYS } from "@/lib/storefront/invite-audit-export";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - STOREFRONT_INVITE_AUDIT_RETENTION_DAYS);

  const result = await prisma.storefrontTeamInviteEvent.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  logger.info("storefront invite audit retention purge", {
    deleted: result.count,
    retentionDays: STOREFRONT_INVITE_AUDIT_RETENTION_DAYS,
    cutoff: cutoff.toISOString(),
  });

  return NextResponse.json({
    ok: true,
    deleted: result.count,
    retentionDays: STOREFRONT_INVITE_AUDIT_RETENTION_DAYS,
    cutoff: cutoff.toISOString(),
  });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
