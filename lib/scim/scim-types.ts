import type { WorkspaceMemberRole } from "@prisma/client";

import type { ScimAssignableRole } from "@/lib/scim/scim-constants";

export type ScimUserResource = {
  schemas: string[];
  id: string;
  externalId?: string;
  userName: string;
  name?: { formatted?: string };
  emails?: Array<{ value: string; primary?: boolean }>;
  active: boolean;
  groups?: Array<{ value: string; display?: string }>;
  meta: {
    resourceType: "User";
    created: string;
    lastModified: string;
    location: string;
  };
  "urn:kitchenos:params:scim:schemas:extension:workspace:2.0:User"?: {
    role: ScimAssignableRole;
  };
};

export type ScimGroupResource = {
  schemas: string[];
  id: string;
  displayName: string;
  members?: Array<{ value: string; display?: string }>;
  meta: {
    resourceType: "Group";
    location: string;
  };
};

export type ScimListResponse<T> = {
  schemas: string[];
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  Resources: T[];
};

export type ScimErrorBody = {
  schemas: string[];
  detail: string;
  status: string;
  scimType?: string;
};

export type ScimCreateUserInput = {
  userName: string;
  externalId?: string;
  name?: { formatted?: string };
  emails?: Array<{ value: string; primary?: boolean }>;
  active?: boolean;
  role?: ScimAssignableRole;
};

export type ScimPatchOperation = {
  op: "replace" | "add" | "remove";
  path?: string;
  value?: unknown;
};

export function toScimAssignableRole(
  role: WorkspaceMemberRole,
): ScimAssignableRole | null {
  if (role === "OWNER") return null;
  if (role === "ADMIN" || role === "STAFF" || role === "PARTNER") return role;
  return "STAFF";
}

export function normalizeScimUserName(userName: string): string {
  return userName.trim().toLowerCase();
}
