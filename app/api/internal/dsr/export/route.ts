import { NextResponse } from "next/server";
import { z } from "zod";

import { requireSessionUser } from "@/lib/auth";
import { hasSuperAdminRoleRow } from "@/lib/platform-super-bypass";
import { verifyImpersonationMfa } from "@/lib/platform/impersonation-mfa";
import { rejectCrossSiteMutation } from "@/lib/security/mutation-origin-guard";
import {
  buildUserDataExportBundle,
  logDsrExportRequested,
} from "@/services/dsr/user-data-export-service";

const bodySchema = z.object({
  userId: z.string().uuid(),
  totpCode: z.string().min(4).max(12).optional(),
  stepUpToken: z.string().min(8).max(256).optional(),
});

/**
 * Manual data-subject export (superadmin + MFA). No automatic erasure.
 * POST /api/internal/dsr/export
 */
export async function POST(request: Request) {
  const originBlock = rejectCrossSiteMutation(request);
  if (originBlock) return originBlock;

  const session = await requireSessionUser();
  if (!(await hasSuperAdminRoleRow(session.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (
    !verifyImpersonationMfa({
      totpCode: parsed.data.totpCode ?? null,
      stepUpToken: parsed.data.stepUpToken ?? null,
    })
  ) {
    return NextResponse.json({ error: "MFA required" }, { status: 403 });
  }

  const bundle = await buildUserDataExportBundle(parsed.data.userId);
  if (!bundle.ok) {
    return NextResponse.json({ error: bundle.error }, { status: 404 });
  }

  await logDsrExportRequested({
    actorUserId: session.id,
    targetUserId: parsed.data.userId,
    workspaceId: bundle.workspace?.id ?? null,
  });

  return NextResponse.json(bundle, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    },
  });
}
