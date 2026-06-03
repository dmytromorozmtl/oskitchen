import { NextResponse } from "next/server";

import { guardPublicApiV1Resource, isGuardError, publicApiJson } from "@/lib/api-public/guard";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const guard = await guardPublicApiV1Resource(
    request,
    "staff",
    "GET",
    "public_api_staff_get",
  );
  if (isGuardError(guard)) return guard.response;

  const staff = await prisma.staffMember.findMany({
    where: { userId: guard.userId, status: "ACTIVE" },
    select: { id: true, name: true, roleType: true, email: true },
    orderBy: { name: "asc" },
  });

  return publicApiJson(guard, { data: staff });
}
