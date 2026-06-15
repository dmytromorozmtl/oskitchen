import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { hashAutoConcludeApprovalToken } from "@/lib/storefront/theme-experiment-auto-conclude-approval";
import {
  clearOrchestratorSlackPending,
  readMultiAgentOrchestrator,
  runMultiAgentOrchestratorCycle,
} from "@/lib/storefront/theme-experiment-multi-agent-orchestrator";
import {
  experimentApproveConfirmHtml,
  readApprovalToken,
} from "@/lib/storefront/experiment-approve-confirm";
import { enforceStorefrontRouteRateLimit } from "@/lib/storefront/storefront-rate-limit";

const querySchema = z.object({
  token: z.string().min(1),
  storefrontId: z.string().min(1),
});

export async function GET(request: Request) {
  const rate = await enforceStorefrontRouteRateLimit(request, "experiment");
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    token: url.searchParams.get("token")?.trim(),
    storefrontId: url.searchParams.get("storefrontId")?.trim(),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing token or storefrontId" }, { status: 400 });
  }

  return experimentApproveConfirmHtml({
    title: "Approve orchestrator plan",
    description: "Confirm to execute the multi-agent orchestrator plan for this storefront.",
    actionPath: url.pathname,
    hiddenFields: {
      token: parsed.data.token,
      storefrontId: parsed.data.storefrontId,
    },
    submitLabel: "Approve plan",
  });
}

export async function POST(request: Request) {
  const rate = await enforceStorefrontRouteRateLimit(request, "experiment");
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const url = new URL(request.url);
  let token = (await readApprovalToken(request))?.trim();
  let storefrontId = url.searchParams.get("storefrontId")?.trim();

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as {
      token?: string;
      storefrontId?: string;
    } | null;
    token = body?.token?.trim() ?? token;
    storefrontId = body?.storefrontId?.trim() ?? storefrontId;
  } else {
    const fd = await request.formData().catch(() => null);
    if (fd) {
      token = String(fd.get("token") ?? "").trim() || token;
      storefrontId = String(fd.get("storefrontId") ?? "").trim() || storefrontId;
    }
  }

  const parsed = querySchema.safeParse({ token, storefrontId });
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing token or storefrontId" }, { status: 400 });
  }

  const sf = await prisma.storefrontSettings.findFirst({
    where: { id: parsed.data.storefrontId },
    select: { id: true, themeExperimentJson: true },
  });
  if (!sf) {
    return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
  }

  const orch = readMultiAgentOrchestrator(sf.themeExperimentJson);
  const hash = hashAutoConcludeApprovalToken(parsed.data.token);
  if (!orch?.slackApprovalTokenHash || orch.slackApprovalTokenHash !== hash) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
  }

  let merged = clearOrchestratorSlackPending(sf.themeExperimentJson);
  const cycle = runMultiAgentOrchestratorCycle(merged);
  merged = cycle.json;

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  return NextResponse.json({ ok: true, message: "Orchestrator plan approved and executed." });
}
