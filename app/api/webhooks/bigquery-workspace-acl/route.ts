import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  mergeWorkspaceAclRows,
  type BqWorkspaceAclRow,
} from "@/lib/compliance/experiment-bq-private-link";
import { prisma } from "@/lib/prisma";

const rowSchema = z.object({
  workspaceId: z.string().min(1).max(120),
  storeSlug: z.string().min(1).max(120),
  role: z.enum(["OWNER", "EDITOR", "VIEWER", "AUDITOR"]),
  principalEmail: z.string().email(),
});

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  rows: z.array(rowSchema).min(1),
});

/**
 * BQ row-level workspace ACL sync → bqPrivateLinkAudit.aclRows.
 * Auth: Bearer BIGQUERY_WORKSPACE_ACL_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.BIGQUERY_WORKSPACE_ACL_WEBHOOK_SECRET,
  });
  if (authError) {
    return authError;
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const sf = await prisma.storefrontSettings.findFirst({
    where: { storeSlug: parsed.data.storeSlug },
    select: { id: true, themeExperimentJson: true },
  });
  if (!sf) {
    return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
  }

  const rows: BqWorkspaceAclRow[] = parsed.data.rows;
  const merged = mergeWorkspaceAclRows(sf.themeExperimentJson, rows);

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("bigquery_workspace_acl_webhook", {
    storeSlug: parsed.data.storeSlug,
    rowCount: rows.length,
  });

  return NextResponse.json({ ok: true, storefrontId: sf.id, rowLevelAclCount: rows.length });
}
