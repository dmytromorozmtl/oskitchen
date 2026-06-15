import { NextResponse } from "next/server";

import {
  SCIM_CONTENT_TYPE,
  SCIM_ERROR_SCHEMA,
} from "@/lib/scim/scim-constants";
import type { ScimErrorBody } from "@/lib/scim/scim-types";

export function scimJsonResponse(
  body: unknown,
  status = 200,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Content-Type": SCIM_CONTENT_TYPE },
  });
}

export function scimErrorResponse(input: {
  status: number;
  detail: string;
  scimType?: string;
}): NextResponse {
  const body: ScimErrorBody = {
    schemas: [SCIM_ERROR_SCHEMA],
    detail: input.detail,
    status: String(input.status),
    ...(input.scimType ? { scimType: input.scimType } : {}),
  };
  return scimJsonResponse(body, input.status);
}
