import type { WorkspaceMemberRole } from "@prisma/client";

import { SCIM_ASSIGNABLE_ROLES } from "@/lib/scim/scim-constants";

export type ScimGroupMapping = {
  id: string;
  idpGroupName: string;
  workspaceRole: (typeof SCIM_ASSIGNABLE_ROLES)[number];
};

export type ScimAttributeMapping = {
  userNameSource: "userName" | "emails.primary";
  emailSource: "userName" | "emails.primary";
  displayNameSource: "name.formatted" | "userName";
  externalIdSource: "externalId" | "id";
  roleSource: "extension.role" | "groups.displayName";
};

export type ScimEnterpriseSelfServeConfig = {
  groupMappings: ScimGroupMapping[];
  attributeMapping: ScimAttributeMapping;
};

export const DEFAULT_SCIM_GROUP_MAPPINGS: ScimGroupMapping[] = [
  { id: "grp-admin", idpGroupName: "KitchenOS Admins", workspaceRole: "ADMIN" },
  { id: "grp-staff", idpGroupName: "KitchenOS Staff", workspaceRole: "STAFF" },
  { id: "grp-partner", idpGroupName: "KitchenOS Partners", workspaceRole: "PARTNER" },
];

export const DEFAULT_SCIM_ATTRIBUTE_MAPPING: ScimAttributeMapping = {
  userNameSource: "userName",
  emailSource: "emails.primary",
  displayNameSource: "name.formatted",
  externalIdSource: "externalId",
  roleSource: "extension.role",
};

export const SCIM_SELF_SERVE_SETTINGS_KEY = "scimEnterpriseSelfServe" as const;

export function defaultScimEnterpriseSelfServeConfig(): ScimEnterpriseSelfServeConfig {
  return {
    groupMappings: DEFAULT_SCIM_GROUP_MAPPINGS.map((row) => ({ ...row })),
    attributeMapping: { ...DEFAULT_SCIM_ATTRIBUTE_MAPPING },
  };
}

function isAssignableRole(value: unknown): value is ScimGroupMapping["workspaceRole"] {
  return typeof value === "string" && (SCIM_ASSIGNABLE_ROLES as readonly string[]).includes(value);
}

export function parseScimGroupMappings(raw: unknown): ScimGroupMapping[] {
  if (!Array.isArray(raw)) return defaultScimEnterpriseSelfServeConfig().groupMappings;
  const parsed: ScimGroupMapping[] = [];
  for (const item of raw.slice(0, 20)) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const idpGroupName =
      typeof row.idpGroupName === "string" ? row.idpGroupName.trim().slice(0, 128) : "";
    if (!idpGroupName) continue;
    const id =
      typeof row.id === "string" && row.id.trim()
        ? row.id.trim().slice(0, 64)
        : `grp-${idpGroupName.toLowerCase().replace(/\s+/g, "-").slice(0, 32)}`;
    if (!isAssignableRole(row.workspaceRole)) continue;
    parsed.push({ id, idpGroupName, workspaceRole: row.workspaceRole });
  }
  return parsed.length > 0 ? parsed : defaultScimEnterpriseSelfServeConfig().groupMappings;
}

const ATTRIBUTE_SOURCES = {
  userNameSource: ["userName", "emails.primary"] as const,
  emailSource: ["userName", "emails.primary"] as const,
  displayNameSource: ["name.formatted", "userName"] as const,
  externalIdSource: ["externalId", "id"] as const,
  roleSource: ["extension.role", "groups.displayName"] as const,
};

function pickSource<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  fallback: T[number],
): T[number] {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T[number])
    : fallback;
}

export function parseScimAttributeMapping(raw: unknown): ScimAttributeMapping {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SCIM_ATTRIBUTE_MAPPING };
  const o = raw as Record<string, unknown>;
  return {
    userNameSource: pickSource(
      o.userNameSource,
      ATTRIBUTE_SOURCES.userNameSource,
      DEFAULT_SCIM_ATTRIBUTE_MAPPING.userNameSource,
    ),
    emailSource: pickSource(
      o.emailSource,
      ATTRIBUTE_SOURCES.emailSource,
      DEFAULT_SCIM_ATTRIBUTE_MAPPING.emailSource,
    ),
    displayNameSource: pickSource(
      o.displayNameSource,
      ATTRIBUTE_SOURCES.displayNameSource,
      DEFAULT_SCIM_ATTRIBUTE_MAPPING.displayNameSource,
    ),
    externalIdSource: pickSource(
      o.externalIdSource,
      ATTRIBUTE_SOURCES.externalIdSource,
      DEFAULT_SCIM_ATTRIBUTE_MAPPING.externalIdSource,
    ),
    roleSource: pickSource(
      o.roleSource,
      ATTRIBUTE_SOURCES.roleSource,
      DEFAULT_SCIM_ATTRIBUTE_MAPPING.roleSource,
    ),
  };
}

export function parseScimEnterpriseSelfServeConfig(raw: unknown): ScimEnterpriseSelfServeConfig {
  if (!raw || typeof raw !== "object") return defaultScimEnterpriseSelfServeConfig();
  const o = raw as Record<string, unknown>;
  return {
    groupMappings: parseScimGroupMappings(o.groupMappings),
    attributeMapping: parseScimAttributeMapping(o.attributeMapping),
  };
}

export function scimSelfServeFromSettingsCenter(
  settingsCenterJson: unknown,
): ScimEnterpriseSelfServeConfig {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object") {
    return defaultScimEnterpriseSelfServeConfig();
  }
  const root = settingsCenterJson as Record<string, unknown>;
  return parseScimEnterpriseSelfServeConfig(root[SCIM_SELF_SERVE_SETTINGS_KEY]);
}

export function mergeScimSelfServeIntoSettingsCenter(
  settingsCenterJson: unknown,
  config: ScimEnterpriseSelfServeConfig,
): Record<string, unknown> {
  const base =
    settingsCenterJson && typeof settingsCenterJson === "object"
      ? { ...(settingsCenterJson as Record<string, unknown>) }
      : {};
  base[SCIM_SELF_SERVE_SETTINGS_KEY] = config;
  return base;
}

/** Resolve workspace role from IdP group display names using self-serve mappings. */
export function resolveScimRoleFromIdpGroups(
  idpGroupNames: readonly string[],
  mappings: readonly ScimGroupMapping[],
  fallback: ScimGroupMapping["workspaceRole"] = "STAFF",
): ScimGroupMapping["workspaceRole"] {
  const normalized = new Set(idpGroupNames.map((name) => name.trim().toLowerCase()));
  for (const mapping of mappings) {
    if (normalized.has(mapping.idpGroupName.trim().toLowerCase())) {
      return mapping.workspaceRole;
    }
  }
  return fallback;
}

export function resolveScimRoleFromConfig(input: {
  explicitRole?: WorkspaceMemberRole | string | null;
  idpGroupNames?: readonly string[];
  attributeMapping: ScimAttributeMapping;
  groupMappings: readonly ScimGroupMapping[];
}): ScimGroupMapping["workspaceRole"] {
  if (input.explicitRole && isAssignableRole(input.explicitRole)) {
    return input.explicitRole;
  }
  if (input.attributeMapping.roleSource === "groups.displayName" && input.idpGroupNames?.length) {
    return resolveScimRoleFromIdpGroups(input.idpGroupNames, input.groupMappings);
  }
  return "STAFF";
}

export type ScimRawUserPayload = {
  userName?: string;
  externalId?: string;
  name?: { formatted?: string };
  emails?: Array<{ value: string; primary?: boolean }>;
  groups?: Array<{ display?: string; value?: string }>;
  extensionRole?: ScimGroupMapping["workspaceRole"];
};

export function applyScimAttributeMapping(
  payload: ScimRawUserPayload,
  mapping: ScimAttributeMapping,
): { userName: string; displayName?: string; externalId?: string } {
  const primaryEmail =
    payload.emails?.find((email) => email.primary)?.value ?? payload.emails?.[0]?.value;

  const userName =
    mapping.userNameSource === "emails.primary"
      ? (primaryEmail ?? payload.userName ?? "").trim().toLowerCase()
      : (payload.userName ?? primaryEmail ?? "").trim().toLowerCase();

  const displayName =
    mapping.displayNameSource === "userName"
      ? userName
      : payload.name?.formatted?.trim() || userName;

  const externalId =
    mapping.externalIdSource === "id"
      ? payload.externalId?.trim()
      : payload.externalId?.trim();

  return {
    userName,
    displayName: displayName || undefined,
    externalId: externalId || undefined,
  };
}
