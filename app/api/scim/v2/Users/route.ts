import type { NextRequest } from "next/server";

import {
  toScimUserListResponse,
  toScimUserResource,
} from "@/lib/scim/scim-resources";
import { requireScimContext } from "@/lib/scim/scim-route-guard";
import { scimErrorResponse, scimJsonResponse } from "@/lib/scim/scim-response";
import {
  parseScimCreateUser,
  parseScimUserFilter,
} from "@/lib/scim/scim-validation";
import {
  createScimUser,
  listScimUsers,
} from "@/services/scim/scim-provisioning-service";

export async function GET(request: NextRequest) {
  const guard = await requireScimContext(request);
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const filter = parseScimUserFilter(url.searchParams.get("filter"));
  const startIndex = Number(url.searchParams.get("startIndex") ?? "1");
  const count = Number(url.searchParams.get("count") ?? "200");

  const rows = await listScimUsers({
    workspaceId: guard.context.workspaceId,
    filterUserName: filter?.value ?? null,
    startIndex: Number.isFinite(startIndex) ? startIndex : 1,
    count: Number.isFinite(count) ? count : 200,
  });

  return scimJsonResponse(
    toScimUserListResponse(rows, Number.isFinite(startIndex) ? startIndex : 1),
  );
}

export async function POST(request: NextRequest) {
  const guard = await requireScimContext(request);
  if (!guard.ok) return guard.response;

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

  const parsed = parseScimCreateUser(body);
  if (!parsed.ok) {
    return scimErrorResponse({
      status: 400,
      detail: parsed.detail,
      scimType: parsed.scimType,
    });
  }

  const result = await createScimUser({
    workspaceId: guard.context.workspaceId,
    payload: parsed.input,
  });

  if (!result.ok) {
    return scimErrorResponse(result.error);
  }

  return scimJsonResponse(
    toScimUserResource(result.user),
    result.created ? 201 : 200,
  );
}
