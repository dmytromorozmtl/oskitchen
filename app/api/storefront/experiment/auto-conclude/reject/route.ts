import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashAutoConcludeApprovalToken } from "@/lib/storefront/theme-experiment-auto-conclude-approval";
import { mergeGa4ParityIntoJson } from "@/lib/storefront/ga4-parity-json";
import {
  experimentApproveConfirmHtml,
  readApprovalToken,
} from "@/lib/storefront/experiment-approve-confirm";
import { enforceStorefrontRouteRateLimit } from "@/lib/storefront/storefront-rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const rate = await enforceStorefrontRouteRateLimit(request, "experiment");
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  return experimentApproveConfirmHtml({
    title: "Reject experiment auto-conclude",
    description: "Confirm to cancel the scheduled auto-conclude without publishing.",
    actionPath: url.pathname,
    hiddenFields: { token },
    submitLabel: "Reject auto-conclude",
  });
}

export async function POST(request: Request) {
  const rate = await enforceStorefrontRouteRateLimit(request, "experiment");
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

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
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
  }

  const merged = mergeGa4ParityIntoJson(sf.themeExperimentJson, {
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
    action: "storefront.experiment.auto_conclude_rejected",
    category: "SETTINGS",
    source: "USER",
    entity: { type: "storefront_settings", id: sf.id, label: sf.storeSlug },
    metadata: { storeSlug: sf.storeSlug, via: "approval_link" },
  });

  return NextResponse.redirect(
    new URL("/dashboard/storefront/settings/experiments", request.url).origin,
  );
}
