import type { ImportType } from "@prisma/client";

import {
  resolveImportCenterJobPermissions,
  type ImportCenterJobPermissions,
} from "@/lib/import-center/workspace-import-permission";
import { getImportCenterPageAccess } from "@/lib/import-center/import-center-page-access";

export type { ImportCenterJobPermissions };

export async function getImportCenterJobAccess(input: {
  type: ImportType;
  committable: boolean;
}) {
  const hub = await getImportCenterPageAccess();
  const permissions = resolveImportCenterJobPermissions(hub.actor.granted, input.type, {
    committable: input.committable,
  });
  return { ...hub, permissions };
}
