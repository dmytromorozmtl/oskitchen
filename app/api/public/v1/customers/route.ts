import { NextResponse } from "next/server";
import { z } from "zod";

import { guardPublicApiV1Resource, isGuardError, publicApiJson } from "@/lib/api-public/guard";
import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(request: Request) {
  const guard = await guardPublicApiV1Resource(
    request,
    "customers",
    "GET",
    "public_api_customers_get",
  );
  if (isGuardError(guard)) return guard.response;
  const userId = guard.userId;

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    page: url.searchParams.get("page") ?? "1",
    pageSize: url.searchParams.get("pageSize") ?? "50",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { page, pageSize } = parsed.data;
  const skip = (page - 1) * pageSize;

  const [customers, total] = await Promise.all([
    prisma.kitchenCustomer.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        totalOrders: true,
        lifetimeValueCents: true,
        updatedAt: true,
      },
    }),
    prisma.kitchenCustomer.count({ where: { userId } }),
  ]);

  return publicApiJson(guard, {
    data: customers.map((c) => ({
      id: c.id,
      email: c.email,
      name: c.displayName ?? ([c.firstName, c.lastName].filter(Boolean).join(" ") || c.email),
      orders: c.totalOrders,
      lifetimeCents: c.lifetimeValueCents,
      updatedAt: c.updatedAt.toISOString(),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}
