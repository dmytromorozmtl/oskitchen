import { NextResponse } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { verifyImpersonationMfa } from "@/lib/platform/impersonation-mfa";
import { hasSuperAdminRoleRow } from "@/lib/platform-super-bypass";
import { rejectCrossSiteMutation } from "@/lib/security/mutation-origin-guard";
import {
  buildUserDataExportBundle,
  logDsrExportRequested,
} from "@/services/dsr/user-data-export-service";

export async function POST(request: Request) {
  const csrfBlock = rejectCrossSiteMutation(request);
  if (csrfBlock) return csrfBlock;

  const sessionUser = await requireSessionUser();
  const isSuperAdmin = await hasSuperAdminRoleRow(sessionUser.id);
  if (!isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { userId?: string; totpCode?: string };
  try {
    body = (await request.json()) as { userId?: string; totpCode?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const targetUserId = body.userId?.trim();
  if (!targetUserId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const mfaOk = verifyImpersonationMfa({
    totpCode: body.totpCode ?? "",
  });
  if (!mfaOk) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bundle = await buildUserDataExportBundle(targetUserId);
  if (!bundle.ok) {
    return NextResponse.json({ error: bundle.error }, { status: 404 });
  }

  await logDsrExportRequested({
    actorUserId: sessionUser.id,
    targetUserId,
    workspaceId: bundle.workspace?.id ?? null,
  });

  return NextResponse.json(bundle);
}
