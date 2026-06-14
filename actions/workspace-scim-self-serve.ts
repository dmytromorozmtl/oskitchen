"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { ENTERPRISE_SSO_SCIM_LIVE_PATH } from "@/lib/enterprise/enterprise-sso-scim-live-policy";
import {
  saveScimAttributeMapping,
  saveScimGroupMappings,
} from "@/lib/enterprise/scim-enterprise-self-serve-p2-72-service";
import { SCIM_ASSIGNABLE_ROLES } from "@/lib/scim/scim-constants";
import { requireSettingsCenterMutation } from "@/lib/settings/require-settings-center-mutation";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";

async function requireScimSelfServeActor(operation: string) {
  const gate = await requireSettingsCenterMutation("manage_security", operation);
  if (!gate.ok) {
    return { ok: false as const, error: "You do not have permission to manage SCIM settings." };
  }
  const actor = await requireTenantActor();
  if (!actor.workspaceId) {
    return { ok: false as const, error: "Workspace is not provisioned for SCIM configuration." };
  }
  return { ok: true as const, actor };
}

const groupMappingSchema = z.object({
  id: z.string().min(1).max(64),
  idpGroupName: z.string().min(1).max(128),
  workspaceRole: z.enum(SCIM_ASSIGNABLE_ROLES),
});

const attributeMappingSchema = z.object({
  userNameSource: z.enum(["userName", "emails.primary"]),
  emailSource: z.enum(["userName", "emails.primary"]),
  displayNameSource: z.enum(["name.formatted", "userName"]),
  externalIdSource: z.enum(["externalId", "id"]),
  roleSource: z.enum(["extension.role", "groups.displayName"]),
});

export async function saveScimGroupMappingsAction(
  mappings: Array<{ id: string; idpGroupName: string; workspaceRole: string }>,
) {
  const gate = await requireScimSelfServeActor("save_scim_group_mappings");
  if (!gate.ok) return fail(gate.error);

  const parsed = z.array(groupMappingSchema).max(20).safeParse(mappings);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid group mappings.");
  }

  try {
    const config = await saveScimGroupMappings({
      workspaceId: gate.actor.workspaceId!,
      groupMappings: parsed.data,
    });
    revalidatePath(ENTERPRISE_SSO_SCIM_LIVE_PATH);
    return ok({ message: "Group provisioning mappings saved.", groupCount: config.groupMappings.length });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to save group mappings.");
  }
}

export async function saveScimAttributeMappingAction(input: {
  userNameSource: string;
  emailSource: string;
  displayNameSource: string;
  externalIdSource: string;
  roleSource: string;
}) {
  const gate = await requireScimSelfServeActor("save_scim_attribute_mapping");
  if (!gate.ok) return fail(gate.error);

  const parsed = attributeMappingSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid attribute mapping.");
  }

  try {
    await saveScimAttributeMapping({
      workspaceId: gate.actor.workspaceId!,
      attributeMapping: parsed.data,
    });
    revalidatePath(ENTERPRISE_SSO_SCIM_LIVE_PATH);
    return ok({ message: "SCIM attribute mapping saved." });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to save attribute mapping.");
  }
}
