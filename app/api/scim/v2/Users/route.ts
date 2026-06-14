import type { NextRequest } from "next/server";

import { getScimEnterpriseSelfServeConfig } from "@/lib/enterprise/scim-enterprise-self-serve-p2-72-service";
import {
  applyScimAttributeMapping,
  resolveScimRoleFromConfig,
} from "@/lib/enterprise/scim-enterprise-self-serve-p2-72-settings";
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

  const selfServe = await getScimEnterpriseSelfServeConfig(guard.context.workspaceId);
  const rawBody = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const groupsRaw = Array.isArray(rawBody.groups) ? rawBody.groups : [];
  const idpGroupNames = groupsRaw
    .map((group) => {
      if (!group || typeof group !== "object") return null;
      const display = (group as { display?: unknown }).display;
      return typeof display === "string" ? display : null;
    })
    .filter((name): name is string => Boolean(name));

  const mapped = applyScimAttributeMapping(
    {
      userName: parsed.input.userName,
      externalId: parsed.input.externalId,
      name: parsed.input.name,
      emails: parsed.input.emails,
      groups: idpGroupNames.map((display) => ({ display })),
      extensionRole: parsed.input.role,
    },
    selfServe.attributeMapping,
  );

  const role = resolveScimRoleFromConfig({
    explicitRole: parsed.input.role,
    idpGroupNames,
    attributeMapping: selfServe.attributeMapping,
    groupMappings: selfServe.groupMappings,
  });

  const result = await createScimUser({
    workspaceId: guard.context.workspaceId,
    payload: {
      ...parsed.input,
      userName: mapped.userName || parsed.input.userName,
      externalId: mapped.externalId ?? parsed.input.externalId,
      name: mapped.displayName ? { formatted: mapped.displayName } : parsed.input.name,
      role,
    },
  });

  if (!result.ok) {
    return scimErrorResponse(result.error);
  }

  return scimJsonResponse(
    toScimUserResource(result.user),
    result.created ? 201 : 200,
  );
}
