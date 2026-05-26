import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashAutoConcludeApprovalToken } from "@/lib/storefront/theme-experiment-auto-conclude-approval";
import { mergeGa4ParityIntoJson } from "@/lib/storefront/ga4-parity-json";
import {
  experimentApproveConfirmHtml,
  readApprovalToken,
} from "@/lib/storefront/experiment-approve-confirm";
import { publishStorefrontThemeSnapshot } from "@/services/storefront/storefront-theme-publish-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  return experimentApproveConfirmHtml({
    title: "Approve experiment auto-conclude",
    description:
      "Confirm to publish the winning theme variant and clear the scheduled auto-conclude.",
    actionPath: url.pathname,
    hiddenFields: { token },
    submitLabel: "Approve and publish",
  });
}

export async function POST(request: Request) {
  const token = (await readApprovalToken(request))?.trim();
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const hash = hashAutoConcludeApprovalToken(token);
  const sf = await prisma.storefrontSettings.findFirst({
    where: {
      themeExperimentJson: {
        path: ["autoConcludeApprovalTokenHash"],
        equals: hash,
      },
    },
    select: { id: true, userId: true, storeSlug: true, themeExperimentJson: true },
  });

  if (!sf) {
    return NextResponse.json({ error: "Invalid or expired approval link" }, { status: 404 });
  }

  const publish = await publishStorefrontThemeSnapshot({
    userId: sf.userId,
    storefrontId: sf.id,
  });

  if (!publish.ok) {
    return NextResponse.json({ error: publish.error }, { status: 409 });
  }

  const fresh = await prisma.storefrontSettings.findUnique({
    where: { id: sf.id },
    select: { themeExperimentJson: true },
  });
  const merged = mergeGa4ParityIntoJson(fresh?.themeExperimentJson ?? sf.themeExperimentJson, {
    clearAutoConcludeSchedule: true,
    autoConcludeScheduledAt: null,
    autoConcludeApprovalTokenHash: null,
  });

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  const { auditLog } = await import("@/services/audit/audit-service");
  await auditLog({
    actor: { userId: sf.userId, email: null },
    action: "storefront.experiment.auto_conclude_approved",
    category: "SETTINGS",
    source: "USER",
    entity: { type: "storefront_settings", id: sf.id, label: sf.storeSlug },
    metadata: { storeSlug: sf.storeSlug, via: "approval_link" },
  });

  return NextResponse.redirect(new URL("/dashboard/storefront/advanced", request.url).origin);
}
