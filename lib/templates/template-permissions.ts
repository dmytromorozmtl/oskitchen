import { isSuperAdminEmail } from "@/lib/platform-owner";
import { hasPermission } from "@/lib/permissions/guards";
import { workspacePermissionForTemplateCapability } from "@/lib/templates/template-permission-keys";

import type { TemplateActorScope, TemplateCapability } from "@/lib/templates/template-types";

export type { TemplateCapability } from "@/lib/templates/template-types";

const GRANTS: Record<TemplateCapability, string[]> = {
  "templates.view": [
    "manager", "admin", "accountant", "kitchen_lead", "kitchen",
    "packer", "packing", "driver", "dispatcher", "sales", "viewer",
  ],
  "templates.preview": ["manager", "admin"],
  "templates.apply": ["admin"],
  "templates.rollback": ["admin"],
  "templates.history": ["manager", "admin", "accountant"],
};

export function isSuperAdminTemplates(scope: TemplateActorScope): boolean {
  return isSuperAdminEmail(scope.email);
}

export function canUseTemplates(
  scope: TemplateActorScope,
  cap: TemplateCapability,
): boolean {
  if (isSuperAdminTemplates(scope)) return true;
  if (scope.isOwner) return true;

  const canonical = workspacePermissionForTemplateCapability(cap);
  if (scope.granted && hasPermission(scope.granted, canonical)) {
    return true;
  }

  const role = (scope.role ?? "").toLowerCase();
  return GRANTS[cap]?.includes(role) ?? false;
}
