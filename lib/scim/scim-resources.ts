import type { ScimProvisionedUser } from "@prisma/client";

import {
  SCIM_GROUP_SCHEMA,
  SCIM_LIST_RESPONSE_SCHEMA,
  SCIM_RESOURCE_TYPE_SCHEMA,
  SCIM_SCHEMA_DEFINITION_SCHEMA,
  SCIM_SERVICE_PROVIDER_CONFIG_SCHEMA,
  SCIM_USER_SCHEMA,
  SCIM_WORKSPACE_USER_EXTENSION,
} from "@/lib/scim/scim-constants";
import type {
  ScimGroupResource,
  ScimListResponse,
  ScimUserResource,
} from "@/lib/scim/scim-types";
import { toScimAssignableRole } from "@/lib/scim/scim-types";

function scimBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://app.kitchenos.com";
  return `${base}/api/scim/v2`;
}

export function buildServiceProviderConfig() {
  return {
    schemas: [SCIM_SERVICE_PROVIDER_CONFIG_SCHEMA],
    documentationUri: "https://docs.os-kitchen.com/scim-provisioning-rfc",
    patch: { supported: true },
    bulk: { supported: false, maxOperations: 0, maxPayloadSize: 0 },
    filter: { supported: true, maxResults: 200 },
    changePassword: { supported: false },
    sort: { supported: false },
    etag: { supported: false },
    authenticationSchemes: [
      {
        type: "oauthbearertoken",
        name: "OAuth Bearer Token",
        description: "Workspace-scoped SCIM bearer token",
        specUri: "https://tools.ietf.org/html/rfc6750",
        primary: true,
      },
    ],
    meta: {
      resourceType: "ServiceProviderConfig",
      location: `${scimBaseUrl()}/ServiceProviderConfig`,
    },
  };
}

export function buildScimSchemas() {
  return {
    schemas: [SCIM_LIST_RESPONSE_SCHEMA],
    totalResults: 2,
    startIndex: 1,
    itemsPerPage: 2,
    Resources: [
      {
        schemas: [SCIM_SCHEMA_DEFINITION_SCHEMA],
        id: SCIM_USER_SCHEMA,
        name: "User",
        description: "KitchenOS workspace user",
        attributes: [
          { name: "userName", type: "string", required: true, uniqueness: "server" },
          { name: "externalId", type: "string", required: false },
          { name: "active", type: "boolean", required: false },
        ],
        meta: { resourceType: "Schema", location: `${scimBaseUrl()}/Schemas/${encodeURIComponent(SCIM_USER_SCHEMA)}` },
      },
      {
        schemas: [SCIM_SCHEMA_DEFINITION_SCHEMA],
        id: SCIM_WORKSPACE_USER_EXTENSION,
        name: "KitchenOS Workspace User",
        description: "Workspace role extension",
        attributes: [{ name: "role", type: "string", required: false }],
        meta: {
          resourceType: "Schema",
          location: `${scimBaseUrl()}/Schemas/${encodeURIComponent(SCIM_WORKSPACE_USER_EXTENSION)}`,
        },
      },
    ],
  };
}

export function buildScimResourceTypes() {
  return {
    schemas: [SCIM_LIST_RESPONSE_SCHEMA],
    totalResults: 2,
    startIndex: 1,
    itemsPerPage: 2,
    Resources: [
      {
        schemas: [SCIM_RESOURCE_TYPE_SCHEMA],
        id: "User",
        name: "User",
        endpoint: "/Users",
        schema: SCIM_USER_SCHEMA,
        schemaExtensions: [
          { schema: SCIM_WORKSPACE_USER_EXTENSION, required: false },
        ],
        meta: { resourceType: "ResourceType", location: `${scimBaseUrl()}/ResourceTypes/User` },
      },
      {
        schemas: [SCIM_RESOURCE_TYPE_SCHEMA],
        id: "Group",
        name: "Group",
        endpoint: "/Groups",
        schema: SCIM_GROUP_SCHEMA,
        meta: { resourceType: "ResourceType", location: `${scimBaseUrl()}/ResourceTypes/Group` },
      },
    ],
  };
}

export function toScimUserResource(row: ScimProvisionedUser & {
  userProfile?: { fullName: string | null; email: string } | null;
}): ScimUserResource {
  const role = toScimAssignableRole(row.role) ?? "STAFF";
  const created = row.createdAt.toISOString();
  const location = `${scimBaseUrl()}/Users/${row.id}`;

  return {
    schemas: [SCIM_USER_SCHEMA, SCIM_WORKSPACE_USER_EXTENSION],
    id: row.id,
    externalId: row.externalId ?? undefined,
    userName: row.userName,
    name: row.userProfile?.fullName
      ? { formatted: row.userProfile.fullName }
      : undefined,
    emails: [{ value: row.userName, primary: true }],
    active: row.active,
    [SCIM_WORKSPACE_USER_EXTENSION]: { role },
    meta: {
      resourceType: "User",
      created,
      lastModified: row.updatedAt.toISOString(),
      location,
    },
  };
}

export function toScimUserListResponse(
  rows: Array<ScimProvisionedUser & {
    userProfile?: { fullName: string | null; email: string } | null;
  }>,
  startIndex = 1,
): ScimListResponse<ScimUserResource> {
  const resources = rows.map(toScimUserResource);
  return {
    schemas: [SCIM_LIST_RESPONSE_SCHEMA],
    totalResults: resources.length,
    startIndex,
    itemsPerPage: resources.length,
    Resources: resources,
  };
}

const WORKSPACE_ROLE_GROUPS: Array<{ id: string; displayName: string; role: string }> = [
  { id: "group-admin", displayName: "ADMIN", role: "ADMIN" },
  { id: "group-staff", displayName: "STAFF", role: "STAFF" },
  { id: "group-partner", displayName: "PARTNER", role: "PARTNER" },
];

export function buildScimGroupsList(
  membersByRole: Record<string, string[]>,
): ScimListResponse<ScimGroupResource> {
  const resources: ScimGroupResource[] = WORKSPACE_ROLE_GROUPS.map((g) => ({
    schemas: [SCIM_GROUP_SCHEMA],
    id: g.id,
    displayName: g.displayName,
    members: (membersByRole[g.role] ?? []).map((userId) => ({ value: userId })),
    meta: {
      resourceType: "Group",
      location: `${scimBaseUrl()}/Groups/${g.id}`,
    },
  }));

  return {
    schemas: [SCIM_LIST_RESPONSE_SCHEMA],
    totalResults: resources.length,
    startIndex: 1,
    itemsPerPage: resources.length,
    Resources: resources,
  };
}

export function buildScimGroupResource(
  groupId: string,
  members: string[],
): ScimGroupResource | null {
  const group = WORKSPACE_ROLE_GROUPS.find((g) => g.id === groupId);
  if (!group) return null;
  return {
    schemas: [SCIM_GROUP_SCHEMA],
    id: group.id,
    displayName: group.displayName,
    members: members.map((userId) => ({ value: userId })),
    meta: {
      resourceType: "Group",
      location: `${scimBaseUrl()}/Groups/${group.id}`,
    },
  };
}
