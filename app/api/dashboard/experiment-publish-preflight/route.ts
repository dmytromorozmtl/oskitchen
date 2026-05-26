import { NextResponse } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { collectExperimentPublishGateFailures } from "@/lib/storefront/theme-experiment-publish-preflight";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireSessionUser();
  const sf = await prisma.storefrontSettings.findFirst({ where: { userId: user.id  }, orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    select: { themeExperimentJson: true },
  });
  if (!sf) {
    return NextResponse.json({ ok: true, failures: [] });
  }

  const failures = collectExperimentPublishGateFailures(sf.themeExperimentJson);
  return NextResponse.json({
    ok: failures.length === 0,
    failures,
    blocked: failures.length > 0,
  });
}
