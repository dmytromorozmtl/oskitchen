import { NextResponse } from "next/server";
import { z } from "zod";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { approveCausalDiscoveryCycle } from "@/lib/storefront/theme-experiment-causal-discovery-agent";
import { appendEuAiOversightEntry } from "@/lib/compliance/eu-ai-act";

const bodySchema = z.object({
  storefrontId: z.string().min(1),
  rationale: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  const user = await requireSessionUser();
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
    where: { id: parsed.data.storefrontId, userId: user.id },
    select: { id: true, themeExperimentJson: true },
  });
  if (!sf) {
    return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
  }

  let merged = approveCausalDiscoveryCycle(sf.themeExperimentJson);
  merged = appendEuAiOversightEntry(merged, {
    actorId: user.id,
    action: "approve_publish",
    rationale: `Causal discovery holdout approved: ${parsed.data.rationale}`,
  });

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  return NextResponse.json({ ok: true });
}
