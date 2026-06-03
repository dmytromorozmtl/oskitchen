import type { NextRequest } from "next/server";

import { toScimUserResource } from "@/lib/scim/scim-resources";
import { requireScimContext } from "@/lib/scim/scim-route-guard";
import { scimErrorResponse, scimJsonResponse } from "@/lib/scim/scim-response";
import {
  applyScimPatchToUserState,
  parseScimPatchOperations,
} from "@/lib/scim/scim-validation";
import {
  deprovisionScimUser,
  getScimUser,
  patchScimUser,
} from "@/services/scim/scim-provisioning-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const guard = await requireScimContext(request);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const user = await getScimUser({
    workspaceId: guard.context.workspaceId,
    scimUserId: id,
  });
  if (!user) {
    return scimErrorResponse({ status: 404, detail: "User not found" });
  }

  return scimJsonResponse(toScimUserResource(user));
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const guard = await requireScimContext(request);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const existing = await getScimUser({
    workspaceId: guard.context.workspaceId,
    scimUserId: id,
  });
  if (!existing) {
    return scimErrorResponse({ status: 404, detail: "User not found" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return scimErrorResponse({
      status: 400,
      detail: "Invalid JSON body",
      scimType: "invalidValue",
    });
  }

  const parsed = parseScimPatchOperations(body);
  if (!parsed.ok) {
    return scimErrorResponse({
      status: 400,
      detail: parsed.detail,
      scimType: parsed.scimType,
    });
  }

  const currentRole =
    existing.role === "ADMIN" ||
    existing.role === "STAFF" ||
    existing.role === "PARTNER"
      ? existing.role
      : "STAFF";

  const next = applyScimPatchToUserState({
    active: existing.active,
    role: currentRole,
    operations: parsed.operations,
  });
  if (!next.ok) {
    return scimErrorResponse({
      status: next.status ?? 400,
      detail: next.detail,
      scimType: next.scimType,
    });
  }

  const result = await patchScimUser({
    workspaceId: guard.context.workspaceId,
    scimUserId: id,
    active: next.active,
    role: next.role,
  });

  if (!result.ok) {
    return scimErrorResponse(result.error);
  }

  return scimJsonResponse(toScimUserResource(result.user));
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const guard = await requireScimContext(request);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const result = await deprovisionScimUser({
    workspaceId: guard.context.workspaceId,
    scimUserId: id,
  });

  if (!result.ok) {
    return scimErrorResponse(result.error);
  }

  return new Response(null, { status: 204 });
}
