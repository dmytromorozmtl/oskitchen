import { createElement, type ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  buildImportCenterSubnavLinks,
  type ImportCenterSubnavLink,
} from "@/lib/import-center/import-center-subnav-links";
import {
  canManageImportCenterSettings,
  canUploadAnyImportType,
  canViewImportCenterHub,
} from "@/lib/import-center/workspace-import-permission";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logImportCenterPermissionDenied } from "@/services/import-center/import-center-permission-audit";

export type { ImportCenterSubnavLink } from "@/lib/import-center/import-center-subnav-links";
export { buildImportCenterSubnavLinks } from "@/lib/import-center/import-center-subnav-links";

function deniedCard(message: string): ReactNode {
  return createElement(
    Card,
    { className: "border-border/80 shadow-sm" },
    createElement(
      CardContent,
      { className: "py-8 text-center text-sm text-muted-foreground" },
      message,
    ),
  );
}

export async function getImportCenterPageAccess() {
  const actor = await requireWorkspacePermissionActor();
  return {
    actor,
    canViewHub: canViewImportCenterHub(actor.granted),
    canUpload: canUploadAnyImportType(actor.granted),
    canManageSettings: canManageImportCenterSettings(actor.granted),
  };
}

export async function requireImportCenterHubPageAccess() {
  const access = await getImportCenterPageAccess();
  if (!access.canViewHub) {
    await logImportCenterPermissionDenied(access.actor, {
      requiredPermission: "products.edit",
      capability: "import.view",
      operation: "import_center.hub",
    });
    return {
      ok: false as const,
      deny: deniedCard("You do not have permission to access Import Center."),
    };
  }
  const links = buildImportCenterSubnavLinks(access);
  return { ok: true as const, ...access, links };
}

export async function requireImportCenterUploadPageAccess() {
  const access = await requireImportCenterHubPageAccess();
  if (!access.ok) return access;
  if (!access.canUpload) {
    await logImportCenterPermissionDenied(access.actor, {
      requiredPermission: "products.edit",
      capability: "import.upload",
      operation: "import_center.upload_page",
    });
    return {
      ok: false as const,
      deny: deniedCard("You do not have permission to upload import files."),
    };
  }
  return access;
}

export async function requireImportCenterSettingsPageAccess() {
  const access = await requireImportCenterHubPageAccess();
  if (!access.ok) return access;
  if (!access.canManageSettings) {
    await logImportCenterPermissionDenied(access.actor, {
      requiredPermission: "workspace.settings",
      capability: "import.view",
      operation: "import_center.settings",
    });
    return {
      ok: false as const,
      deny: deniedCard("You do not have permission to view Import Center settings."),
    };
  }
  return access;
}
