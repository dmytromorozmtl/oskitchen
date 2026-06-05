import { NextResponse } from "next/server";

import { requireExportActor } from "@/lib/import-export/require-export-actor";
import {
  buildPortabilityManifestJson,
  loadDataPortabilitySnapshot,
  recordPortabilityManifestExport,
} from "@/services/data/export-service";

export async function GET() {
  const access = await requireExportActor({
    exportType: "reports",
    operation: "export:portability_manifest",
  });
  if (!access.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const snapshot = await loadDataPortabilitySnapshot({
    userId: access.actor.dataUserId,
    sessionUserId: access.actor.sessionUserId,
    granted: access.actor.granted,
  });

  const body = await buildPortabilityManifestJson(snapshot);
  await recordPortabilityManifestExport({
    userId: access.actor.dataUserId,
    sessionUserId: access.actor.sessionUserId,
    snapshot,
  }).catch(() => {});

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kitchenos-portability-manifest.json"',
    },
  });
}
