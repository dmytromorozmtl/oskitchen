import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { ingestCameraLiveFrame } from "@/services/ai/camera-live-service";

const detectionSchema = z.object({
  label: z.string().max(120),
  confidence: z.number().min(0).max(1),
  category: z.enum(["person", "food", "equipment", "ppe", "other"]).optional(),
});

const bodySchema = z.object({
  cameraId: z.string().min(1).max(120),
  stationName: z.string().min(1).max(120),
  queueLength: z.number().int().min(0).optional(),
  detections: z.array(detectionSchema).max(50),
});

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = await resolveOwnerWorkspaceId(session.id);
  if (!workspaceId) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid frame payload" }, { status: 400 });
  }

  const dashboard = await ingestCameraLiveFrame(workspaceId, {
    ...parsed.data,
    analyzedAt: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    analyzedAt: dashboard.analyzedAt,
    dataSource: dashboard.dataSource,
    eventCount: dashboard.events.length,
  });
}
