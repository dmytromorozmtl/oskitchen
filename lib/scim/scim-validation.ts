import type { WorkspaceMemberRole } from "@prisma/client";
import { z } from "zod";

import {
  SCIM_ASSIGNABLE_ROLES,
  SCIM_USER_SCHEMA,
  SCIM_WORKSPACE_USER_EXTENSION,
} from "@/lib/scim/scim-constants";
import type {
  ScimCreateUserInput,
  ScimPatchOperation,
} from "@/lib/scim/scim-types";
import { normalizeScimUserName } from "@/lib/scim/scim-types";

const emailSchema = z.string().email();

const createUserSchema = z.object({
  schemas: z.array(z.string()).optional(),
  userName: z.string().min(3).max(255),
  externalId: z.string().max(512).optional(),
  name: z.object({ formatted: z.string().max(255).optional() }).optional(),
  emails: z
    .array(
      z.object({
        value: z.string().email(),
        primary: z.boolean().optional(),
      }),
    )
    .optional(),
  active: z.boolean().optional(),
  [SCIM_WORKSPACE_USER_EXTENSION]: z
    .object({
      role: z.enum(SCIM_ASSIGNABLE_ROLES).optional(),
    })
    .optional(),
});

export function parseScimCreateUser(body: unknown):
  | { ok: true; input: ScimCreateUserInput }
  | { ok: false; detail: string; scimType?: string } {
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, detail: "Invalid SCIM User payload", scimType: "invalidValue" };
  }

  const data = parsed.data;
  const userName = normalizeScimUserName(data.userName);
  if (!emailSchema.safeParse(userName).success) {
    return {
      ok: false,
      detail: "userName must be a valid email address",
      scimType: "invalidValue",
    };
  }

  const extension = data[SCIM_WORKSPACE_USER_EXTENSION];

  return {
    ok: true,
    input: {
      userName,
      externalId: data.externalId?.trim() || undefined,
      name: data.name,
      emails: data.emails,
      active: data.active ?? true,
      role: extension?.role ?? "STAFF",
    },
  };
}

export function assertScimRoleAssignable(
  role: WorkspaceMemberRole | string,
): role is (typeof SCIM_ASSIGNABLE_ROLES)[number] {
  return (SCIM_ASSIGNABLE_ROLES as readonly string[]).includes(role);
}

export function parseScimPatchOperations(body: unknown):
  | { ok: true; operations: ScimPatchOperation[] }
  | { ok: false; detail: string; scimType?: string } {
  const schema = z.object({
    schemas: z.array(z.string()).optional(),
    Operations: z.array(
      z.object({
        op: z.enum(["replace", "add", "remove"]),
        path: z.string().optional(),
        value: z.unknown().optional(),
      }),
    ),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, detail: "Invalid SCIM PatchOp payload", scimType: "invalidValue" };
  }
  return { ok: true, operations: parsed.data.Operations };
}

export function applyScimPatchToUserState(input: {
  active: boolean;
  role: (typeof SCIM_ASSIGNABLE_ROLES)[number];
  operations: ScimPatchOperation[];
}):
  | { ok: true; active: boolean; role: (typeof SCIM_ASSIGNABLE_ROLES)[number] }
  | { ok: false; detail: string; scimType?: string; status?: number } {
  let { active, role } = input;

  for (const op of input.operations) {
    if (op.op !== "replace") {
      return {
        ok: false,
        detail: `Unsupported PATCH op: ${op.op}`,
        scimType: "mutability",
      };
    }

    const path = op.path?.trim().toLowerCase();
    if (path === "active") {
      if (typeof op.value !== "boolean") {
        return {
          ok: false,
          detail: "active must be boolean",
          scimType: "invalidValue",
        };
      }
      active = op.value;
      continue;
    }

    if (
      path === `${SCIM_WORKSPACE_USER_EXTENSION}:role`.toLowerCase() ||
      path === "role"
    ) {
      const nextRole =
        typeof op.value === "string"
          ? op.value
          : typeof op.value === "object" &&
              op.value !== null &&
              "role" in op.value
            ? String((op.value as { role: unknown }).role)
            : null;
      if (!nextRole || !assertScimRoleAssignable(nextRole)) {
        return {
          ok: false,
          detail: "Cannot assign OWNER or invalid role via SCIM",
          scimType: "mutability",
          status: 403,
        };
      }
      role = nextRole;
      continue;
    }

    return {
      ok: false,
      detail: `Unsupported PATCH path: ${op.path ?? "(missing)"}`,
      scimType: "mutability",
    };
  }

  return { ok: true, active, role };
}

export function parseScimUserFilter(
  filter: string | null,
): { field: "userName"; value: string } | null {
  if (!filter) return null;
  const match = /^userName\s+eq\s+"([^"]+)"$/i.exec(filter.trim());
  if (!match) return null;
  return { field: "userName", value: normalizeScimUserName(match[1]) };
}

export function scimUserSchemas(): string[] {
  return [SCIM_USER_SCHEMA, SCIM_WORKSPACE_USER_EXTENSION];
}
