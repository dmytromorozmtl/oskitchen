import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import {
  buildExperimentAccessCertificationExport,
  replicateSoc2PrefixToSecondaryRegion,
  uploadAccessCertificationToS3,
} from "@/services/storefront/experiment-fedramp-s3-service";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const replicate = await replicateSoc2PrefixToSecondaryRegion();
  const cert = await buildExperimentAccessCertificationExport();
  const uploaded = await uploadAccessCertificationToS3(cert);

  logger.info("soc2_fedramp_replicate_cron", {
    copied: replicate.copied,
    certUsers: cert.users.length,
    uploaded,
  });

  return NextResponse.json({
    ok: true,
    replicate,
    certificationUsers: cert.users.length,
    uploaded,
  });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
