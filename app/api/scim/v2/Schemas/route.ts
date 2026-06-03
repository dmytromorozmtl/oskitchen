import type { NextRequest } from "next/server";

import { buildScimSchemas } from "@/lib/scim/scim-resources";
import { requireScimContext } from "@/lib/scim/scim-route-guard";
import { scimJsonResponse } from "@/lib/scim/scim-response";

export async function GET(request: NextRequest) {
  const guard = await requireScimContext(request);
  if (!guard.ok) return guard.response;
  return scimJsonResponse(buildScimSchemas());
}
