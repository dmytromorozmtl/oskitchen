import { NextResponse } from "next/server";

import type { ImportCapability } from "@/lib/import-center/import-types";
import { canViewImportCenterHub } from "@/lib/import-center/workspace-import-permission";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logImportCenterPermissionDenied } from "@/services/import-center/import-center-permission-audit";

export async function requireImportCenterApiAccess(input?: {
  capability?: ImportCapability;
  operation?: string;
}) {
  const capability = input?.capability ?? "import.view";
  try {
    const actor = await requireWorkspacePermissionActor();
    if (!canViewImportCenterHub(actor.granted)) {
      await logImportCenterPermissionDenied(actor, {
        requiredPermission: "products.edit",
        capability,
        operation: input?.operation ?? `import_center.api.${capability}`,
      });
      return {
        ok: false as const,
        response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      };
    }
    return { ok: true as const, actor };
  } catch {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
}
