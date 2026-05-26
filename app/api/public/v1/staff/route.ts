import { NextResponse } from "next/server";

import { guardPublicApi, isGuardError } from "@/lib/api-public/guard";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const guard = await guardPublicApi(request, "public_api_staff_get");
  if (isGuardError(guard)) return guard.response;

  const staff = await prisma.staffMember.findMany({
    where: { userId: guard.userId, status: "ACTIVE" },
    select: { id: true, name: true, roleType: true, email: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: staff });
}
