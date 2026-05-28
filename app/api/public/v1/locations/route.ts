import { NextResponse } from "next/server";

import { guardPublicApiV1Resource, isGuardError } from "@/lib/api-public/guard";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const guard = await guardPublicApiV1Resource(
    request,
    "locations",
    "GET",
    "public_api_locations_get",
  );
  if (isGuardError(guard)) return guard.response;

  const locations = await prisma.location.findMany({
    where: { userId: guard.userId, active: true },
    select: { id: true, name: true, type: true, status: true, timezone: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: locations });
}
