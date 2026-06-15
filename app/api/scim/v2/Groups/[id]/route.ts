import type { NextRequest } from "next/server";

import { buildScimGroupResource } from "@/lib/scim/scim-resources";
import { requireScimContext } from "@/lib/scim/scim-route-guard";
import { scimErrorResponse, scimJsonResponse } from "@/lib/scim/scim-response";
import { listScimGroupMembers } from "@/services/scim/scim-provisioning-service";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const guard = await requireScimContext(request);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const membersByRole = await listScimGroupMembers(guard.context.workspaceId);
  const group = buildScimGroupResource(
    id,
    id === "group-admin"
      ? membersByRole.ADMIN
      : id === "group-staff"
        ? membersByRole.STAFF
        : id === "group-partner"
          ? membersByRole.PARTNER
          : [],
  );

  if (!group) {
    return scimErrorResponse({ status: 404, detail: "Group not found" });
  }

  return scimJsonResponse(group);
}
