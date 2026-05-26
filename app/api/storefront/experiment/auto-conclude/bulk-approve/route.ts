import { NextResponse } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashAutoConcludeApprovalToken } from "@/lib/storefront/theme-experiment-auto-conclude-approval";
import { publishStorefrontThemeSnapshot } from "@/services/storefront/storefront-theme-publish-service";
import { mergeGa4ParityIntoJson } from "@/lib/storefront/ga4-parity-json";

export const dynamic = "force-dynamic";

/** POST { tokens: string[] } — agency owner approves multiple pending auto-concludes. */
export async function POST(request: Request) {
  const user = await requireSessionUser();
  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (profile?.role !== "OWNER") {
    return NextResponse.json({ error: "Owner only" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { tokens?: string[] } | null;
  const tokens = body?.tokens?.filter((t) => typeof t === "string" && t.trim()) ?? [];
  if (tokens.length === 0) {
    return NextResponse.json({ error: "No tokens" }, { status: 400 });
  }

  const results: { token: string; ok: boolean; storeSlug?: string; error?: string }[] = [];

  for (const token of tokens.slice(0, 20)) {
    const hash = hashAutoConcludeApprovalToken(token.trim());
    const sf = await prisma.storefrontSettings.findFirst({
      where: {
        userId: user.id,
        themeExperimentJson: {
          path: ["autoConcludeApprovalTokenHash"],
          equals: hash,
        },
      },
      select: { id: true, userId: true, storeSlug: true, themeExperimentJson: true },
    });

    if (!sf) {
      results.push({ token, ok: false, error: "invalid_token" });
      continue;
    }

    const publish = await publishStorefrontThemeSnapshot({
      userId: sf.userId,
      storefrontId: sf.id,
    });

    if (!publish.ok) {
      results.push({ token, ok: false, storeSlug: sf.storeSlug, error: publish.error });
      continue;
    }

    const fresh = await prisma.storefrontSettings.findUnique({
      where: { id: sf.id },
      select: { themeExperimentJson: true },
    });
    const merged = mergeGa4ParityIntoJson(fresh?.themeExperimentJson, {
      clearAutoConcludeSchedule: true,
      autoConcludeScheduledAt: null,
      autoConcludeApprovalTokenHash: null,
    });
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });

    results.push({ token, ok: true, storeSlug: sf.storeSlug });
  }

  return NextResponse.json({ ok: true, results });
}
