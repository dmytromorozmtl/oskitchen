import { NextResponse } from "next/server";

import { getAuthenticatedUserId } from "@/lib/api-session";
import { resolveTenantDataUserId } from "@/lib/scope/resolve-tenant-data-user-id";
import { integrationConnectionByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export async function requireConnectionOwner(connectionId: string) {
  const sessionUserId = await getAuthenticatedUserId();
  if (!sessionUserId) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as const;
  }
  const dataUserId = await resolveTenantDataUserId(sessionUserId);
  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(dataUserId, connectionId),
  });
  if (!conn) {
    return {
      error: NextResponse.json({ error: "Connection not found" }, { status: 404 }),
    } as const;
  }
  return { userId: dataUserId, sessionUserId, conn } as const;
}
