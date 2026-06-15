import type { PermissionKey } from "@/lib/permissions/permissions";
import type { TemplateCapability } from "@/lib/templates/template-types";

const PARTICIPANT_CAPABILITIES = new Set<TemplateCapability>([
  "templates.view",
  "templates.preview",
  "templates.history",
]);

/** Map template capabilities to canonical workspace permission keys. */
export function workspacePermissionForTemplateCapability(
  capability: TemplateCapability,
): PermissionKey {
  if (PARTICIPANT_CAPABILITIES.has(capability)) {
    return "templates.participate";
  }
  return "templates.manage";
}
