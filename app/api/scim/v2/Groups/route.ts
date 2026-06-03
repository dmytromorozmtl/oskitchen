import type { NextRequest } from "next/server";

import {
  buildScimGroupsList,
  buildScimGroupResource,
} from "@/lib/scim/scim-resources";
import { requireScimContext } from "@/lib/scim/scim-route-guard";
import { scimErrorResponse, scimJsonResponse } from "@/lib/scim/scim-response";
import { listScimGroupMembers } from "@/services/scim/scim-provisioning-service";

export async function GET(request: NextRequest) {
  const guard = await requireScimContext(request);
  if (!guard.ok) return guard.response;

  const membersByRole = await listScimGroupMembers(guard.context.workspaceId);
  return scimJsonResponse(buildScimGroupsList(membersByRole));
}
