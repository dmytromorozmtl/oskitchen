import { NextResponse } from "next/server";

import { buildOpenApiDocument, countApiRoutes } from "@/lib/api/openapi-spec";

export const dynamic = "force-dynamic";

export async function GET() {
  const doc = buildOpenApiDocument();
  return NextResponse.json(doc, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "X-Route-Count": String(countApiRoutes()),
    },
  });
}
