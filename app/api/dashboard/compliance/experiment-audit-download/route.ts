import { NextResponse } from "next/server";

import { userHasExperimentAuditorAccess } from "@/lib/auth/experiment-auditor-access";
import { requireSessionUser } from "@/lib/auth";
import { createPresignedGetUrl } from "@/services/storefront/experiment-soc2-s3-service";

export const dynamic = "force-dynamic";

/** Presigned S3 download for external auditors — no server filesystem reads. */
export async function GET(request: Request) {
  const user = await requireSessionUser();
  const ok = await userHasExperimentAuditorAccess(user.id);
  if (!ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key")?.trim();
  if (!key || key.includes("..") || !key.startsWith("soc2/")) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const prefix = (process.env.AUDIT_ARCHIVE_S3_PREFIX ?? "experiment-audit").replace(/\/$/, "");
  const fullKey = `${prefix}/${key}`;
  const url = createPresignedGetUrl({ key: fullKey });
  if (!url) {
    return NextResponse.json({ error: "S3 presign not configured" }, { status: 503 });
  }

  return NextResponse.redirect(url, { status: 302 });
}
